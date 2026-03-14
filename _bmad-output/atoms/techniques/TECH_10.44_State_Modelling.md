# Technique: State Modelling (10.44)

10.44             State Modelling
                                                                       10.44.1       Purpose
                                                                                     State modelling is used to describe and analyze the different possible states of an




Complimentary IIBA® Member Copy. Not for Distribution or Resale.
                                                                                     entity within a system, how that entity changes from one state to another, and
                                                                                     what can happen to the entity when it is in each state.

                                                                       10.44.2       Description
                                                                                     An entity is an object or concept within a system. An entity may be used in several
                                                                                     processes. The life cycle of every entity has a beginning and an end.
                                                                                     In a state model (also sometimes called a state transition model), a state is a
                                                                                     formal representation of a status. It is used when it is necessary to have a precise
                                                                                     and consistent understanding of an entity that has complex behaviour and
                                                                                     complex rules about that behaviour.
                                                                                     A state model describes:
                                                                                        • a set of possible states for an entity,
                                                                                        • the sequence of states that the entity can be in,
                                                                                        • how an entity changes from one state to another,
                                                                                        • the events and conditions that cause the entity to change states, and
                                                                                        • the actions that can or must be performed by the entity in each state as it
                                                                                          moves through its life cycle.
                                                                                     While a process model can show all of the entities that are used in or affected by
                                                                                     that process, a state model shows a complementary view: what happens to one
                                                                                     entity across all the processes that affect it or use it.

                                                                       10.44.3       Elements

                                                                                     .1 State
                                                                                     An entity has a finite number of states during its life cycle, although it can be in
                                                                                     more than one state at a time. Each state is described with a name and the
                                                                                     activities that could be performed while in that state. There may be rules about
                                                                                     which activities must or can be performed and which events it can respond to or
                                                                                     trigger.


                                                                                                                  348
Techniques                                                                         State Modelling

             A complex state can be decomposed into sub-states.

             .2 State Transition
             How the entity changes or transitions from one state to another could be
             determined by the steps of a process, by business rules, or by information
             content. The sequence of states of an entity are not always linear; an entity could
             skip over several states or revert to a previous state, perhaps more than once.
             A transition may be conditional (triggered by a specific event or a condition being
             reached) or automatic (triggered by the completion of the required activities while
             in the previous state or by the passage of time). It may also be recursive, leaving
             one state and returning back to the same state. A transition is described in terms
             of the event that causes the transition, conditions which determine whether or
             not the entity must respond to that event, and actions that occur in association
             with the event.




                                                                                                     Complimentary IIBA® Member Copy. Not for Distribution or Resale.
             .3 State Diagram
             A state diagram shows the life cycle of one entity, beginning when the entity first
             comes into existence and moving through all of the different states that the entity
             may have until it is discarded and no longer of use.
             A state on a state diagram is shown as a rectangle with rounded corners. There
             may be any number of states. A state may be decomposed into sub-states.
             The transition from one state to another state is shown with a one-directional
             arrow pointing from the start state to the destination state, optionally labelled
             with the name of the event that causes the entity’s state to change from one state
             to another, and optionally with conditions and actions.
             The beginning and end of the entity’s life cycle are shown with special symbols for
             both the initial state, which indicates that the entity has come into existence, and
             the final state, which indicates that the entity is discarded and the life cycle is
             complete.

             Figure 10.44.1: State Transition Diagram


               Initial State

                                            State 1                   State 2
                               Transition


                                                        State 3




                                                      Final State




                                              349
                                                                   Survey or Questionnaire                                                                               Techniques

                                                                                             .4 State Tables
                                                                                             A state table is a two-dimensional matrix showing states and the transitions
                                                                                             between them. It can be used during elicitation and analysis either as an
                                                                                             alternative, a precursor, or a complement to a state diagram. It is a simple way to
                                                                                             get started on a state model in order to elicit the state names and event names
                                                                                             from the domain subject matter experts.
                                                                                             Each row shows a starting state, the transition, and the end state. If one state
                                                                                             could respond to several transitions, there will be a separate row for each
                                                                                             transition.
                                                                                             A state that appears as an end state in one row could be a start state in another
                                                                                             row.

                                                                       10.44.4               Usage Considerations




Complimentary IIBA® Member Copy. Not for Distribution or Resale.
                                                                                             .1 Strengths
                                                                                             • Identifies business rules and information attributes that apply to the entity
                                                                                               being modelled.
                                                                                             • Identifies and describes the activities that apply to the entity at different states
                                                                                               of the entity.
                                                                                             • Is a more effective documentation and communication tool than plain text,
                                                                                               especially if the entity being described has more than a few states, transitions,
                                                                                               and conditions governing those transitions.

                                                                                             .2 Limitations
                                                                                             • Is usually only used to understand and communicate about information entities
                                                                                               that are perceived to be complex; simple entities may be understood without
                                                                                               the time and effort required to build a state model.
                                                                                             • Building a state model appears simple at the start, but achieving a consensus
                                                                                               among domain SMEs about the details required by the model can be difficult
                                                                                               and time-consuming.
                                                                                             • A high degree of precision about states and transitions is required to build a
                                                                                               state diagram; some domain SMEs and business analysis practitioners are
                                                                                               uncomfortable trying to describe such a level of detail.