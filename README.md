# FSA

FSA is an abbreviation for Finite State Automaton (or Automata), it is a small lib for creating 
asynchronous, non-deterministic, hierarchical finite-state machines in JavaScript.

[Find out more here](http://en.wikipedia.org/wiki/Finite-state_machine)

## Contact

You can contact me on Twitter with questions/remarks : [@camillereynders](http://twitter.com/camillereynders)

or send me a mail at:
info [at] creynders [dot] be

## Inspiration

FSA is inspired by the fsm's of 

* [Cássio S. Antonio](https://github.com/cassiozen/AS3-State-Machine)

* [Neil Manuell](http://statemachine.org/)

* [Jake Gordon](http://codeincomplete.com/posts/2012/1/7/javascript_state_machine_v2_1_0/)

## Resources

[API documentation](http://creynders.github.com/fsa/docs)

## Dependencies

FSA has no dependencies on other frameworks. 
[jasmine](https://github.com/pivotal/jasmine) is used for testing.

## FEATURES

* Framework independent: doesn't rely on any other 3rd party frameworks.

* Framework integration: easily used on top of other frameworks.

* Hierarchical states: states can be configured to have an unlimited number of substates, an unlimited number of levels deep.

* Guards: an unlimited amount of callbacks can be set to guard both entry and exit of states.

* Actions: an unlimited amount of callbacks can be executed on both entry and exit of states.

* Granular: both state-specific event listening and automaton-wide event listening is possible.

## TODO

* Optimize and refactor. FSA's gone through various implementations and though I tried to keep it clean and lean, there's definitely a ton of stuff that can be optimized. At the moment I concentrated more on the API than on the actual implementation.

* Tests: although I tried to create all tests I could think of, there's undoubtedly a large amount of (unwanted) behaviours that still need to be tested.

* Docs: the API documentation needs to be completed.

* Demo: a working demo should be created.
