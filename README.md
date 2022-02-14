# Exploring tradeoffs in implementing React contexts

A better name for this repo would be something like react-context-tradeoffs, but I was never much good at naming things...

## The high level design problem

In my group, we're trying to develop a React context provider that abstracts away the loading and playback of multi-track audio with the WebAudio API. The details of WebAudio aren't that important here, but the main issue, as will become apparent, is that a lot of the operations on the audio graph we're maintaining can be seen as side effects that occur in response to changes in state. But I'm getting ahead of myself....

## Is this a good use case for a context in React

The rationale for creating a context for handling audio playback is that the UI itself for displaying the structure of the audio to the user and providing controls for play/pause and scrubbing of the playhead is a fairly complex tree of components, all of which need access to the underlying state of loaded audio and controls for playback, etc. That alone seems like a good use case for a context.

In addition, we're hoping to put the audio context in a separate, re-usable package so we can use it across multiple web apps. Because of that intention, we're putting a lot of thought into what state attributes and controls the context provider exposes to the consumer. We'd like to avoid exposing internal state that only matters to the provider. 

# Problems we ran into

We originally decided NOT to use a reducer in the provider. We had reasons for this choice; maybe not the best reasons, but here they are:
* There was a feeling that the dispatch/reducer boiler plate would make it harder for maintainers of the audio engine package to understand what the code was doing and, we reasoned, one can accomplish the same thing by maintaining individual state variables and updating them as needed. _Spoiler: this reason turns out to not be that compelling._
* A more compelling reason is that nearly everything our context provider needs to do is a side effect in the sense that it's delegating UI rendering completely to its consumer and just focusing on maintaining things like an audio graph and some interval timers. We knew that if we were to write a reducer, it should be a pure function with no side effect and it wasn't obvious to us how well that might work at the level of complexity we're dealing with. We're still not sure, but this example begins to sketch it out.

One consequence of not using a reducer, which we didn't really understand at first, is that we ran into several cases where we were generating stale closures. One of these cases was internal to the context provider and the other was actually showing up in the consumer code. We found fixes for both cases, but our fixes had some things we weren't crazy about:

For the internal stale closure, our fix was to update state with a functional form that looks like 
```
setState(currentState => {
    //...some conditional logic and side effects
    return {
        ...currentState,
        ...updatesToState
    }
})
```
We weren't happy with the conditional logic and side effects in our state update function, but it was the only way we found to avoid the update depending on stale state.

The stale closure on the consumer side was in the form of an event listener that was installed with a `useEffect` hook. The code for the listener _seemed_ to have no dependencies, so we used an empty dependency array in `useEffect`, thinking that we only needed to install the event listener on the first render of the consumer and it would be fine. But, since the event handler was calling one of the controls exposed by our context provider, it turned out that we'd created a stale closure that cause the provider to operate on stale state when invoked. The solution was to add attributes from the provider to the dependency array of `useEffect` which causes the event listener to be torn down and re-installed when provider state changed. We weren't crazy about this solution, however. For one thing, depending on the entire state of the provider would cause the event listener to be torn down very frequently, much more than necessary. (When playing back audio, the state of the provider is changing very fast to keep up with the elapsed time of played out audio.) We found several ways to be more selective about what provider state we put into the dependency array, but we were still not happy that the consumer seemed to need to know more about the provider than we wanted and that the provider had to introduce more implementation complexity to make it easier for the consumer. And this was all so we could do an operation (togglePlayback) that the provider should be able to handle without forcing the consumer to know about it's current state.

## So what's in this example

In this example we tried to pare away all unrelated detail and just expose the crux of the problem. Our context provider is reduced to maintaining an interval timer that counts how many times it fires. The count is one piece of state. The other piece of state is a boolean `running` that the consumer can use to detect whether the interval timer is currently running or not. Apart from that state, the provider also exposes a `toggleInterval` control that the consumer can use to turn on and off the timer.
The consumer creates the following simple UI:
* A button that displays the current count value and changes color depending on whether the timer is running.
* Pressing the button toggles the provider via the exposed control
* A keydown event listener allows the user the alternative of toggling the provider by pressing the space bar.

We implement the context provider in two different ways. Once with a reducer and once with individual `useState` variables that get updated individually.

## What we learned

We confirmed for ourselves that relying on `useReducer` in our context provider makes it much easier to avoid the stale closure problems we were seeing. Especially nice is that the reducer eliminates the need for the consumer to put state from the provider in its dependency array for `useEffect`. So that feels like it does a better job of keeping separate concerns separated.

However, we are starting to see the consequence of having a pure reducer function in a context provider that has to manage side-effects. We had to introduce a new state variable `toggling` to keep track of the time between when the consumer requests a toggle and when the side effects have actually take place. And our dispatch function needs a pair of action types: `TOGGLE` and `TOGGLE_SUCCESS`. The additional state allows us to create a `useEffect` that handles the side effects and then turns off the `toggling` flag and dispatches `TOGGLE_SUCCESS` to indicate that it's all done. When the reducer sees the `TOGGLE_SUCCESS` action, it can actually toggle the value of `running`.

So that's our tradeoff: `useReducer` seems like the right way to protect ourselves from all sorts of bugs related to stale closures. But dealing with lots of side effects is going to add complexity to our reducer and provider state. We might take a look at some custom hooks like 
