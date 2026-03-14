# Technique: Use Cases and Scenarios (10.47)

10.47                     Use Cases and Scenarios
                                                                      10.47.1                Purpose
                                                                                             Use cases and scenarios describe how a person or system interacts with the
                                                                                             solution being modelled to achieve a goal.

                                                                      10.47.2                Description
                                                                                             Use cases describe the interactions between the primary actor, the solution, and
                                                                                             any secondary actors needed to achieve the primary actor's goal. Use cases are
                                                                                             usually triggered by the primary actor, but in some methods may also be triggered
                                                                                             by another system or by an external event or timer.
                                                                                             A use case describes the possible outcomes of an attempt to accomplish a




Complimentary IIBA® Member Copy. Not for Distribution or Resale.
                                                                                             particular goal that the solution will support. It details different paths that can be
                                                                                             followed by defining primary and alternative flows. The primary or basic flow
                                                                                             represents the most direct way to accomplish the goal of the use case. Special
                                                                                             circumstances and exceptions that result in a failure to complete the goal of the
                                                                                             use case are documented in alternative or exception flows. Use cases are written
                                                                                             from the point of view of the actor and avoid describing the internal workings of
                                                                                             the solution.
                                                                                             Use case diagrams are a graphical representation of the relationships between
                                                                                             actors and one or more use cases supported by the solution.
                                                                                             Some use case approaches distinguish between business use cases and system
                                                                                             use cases, with business use cases describing how actors interact with a particular
                                                                                             process or business function, and system use cases describing the interaction
                                                                                             between an actor and a software application.
                                                                                             A scenario describes just one way that an actor can accomplish a particular goal.
                                                                                             Scenarios are written as a series of steps performed by actors or by the solution
                                                                                             that enable an actor to achieve a goal. A use case describes several scenarios.

                                                                      10.47.3                Elements
                                                                                             There is no fixed, universal format for use cases. The following elements are
                                                                                             frequently captured in a use case description.

                                                                                             .1 Use Case Diagram
                                                                                             A use case diagram visually depicts the scope of the solution, by showing the
                                                                                             actors who interact with the solution, which use cases they interact with, and any
                                                                                             relationships between the use cases. Unified Modelling Language™ (UML®)
                                                                                             describes the standard notation for a use case diagram.

                                                                                             Relationships

                                                                                             Relationships between actors and use cases are called associations. An association
                                                                                             line indicates that an actor has access to the functionality represented by the use


                                                                                                                          356
Techniques                                                                    Use Cases and Scenarios

             case. Associations do not represent input, output, time, or dependency.
             There are two commonly used relationships between use cases:
                • Extend: allows for the insertion of additional behavior into a use case. The
                  use case that is being extended must be completely functional in its own
                  right and must not depend on the extending use case for its successful
                  execution. This relationship may be used to show that an alternate flow has
                  been added to an existing use case (representing new requirements).
                • Include: allows for the use case to make use of functionality present in
                  another use case. The included use case does not need to be a complete
                  use case in its own right if it is not directly triggered by an actor. This
                  relationship is most often used either when some shared functionality is
                  required by several use cases or to abstract out a complex piece of logic.




                                                                                                        Complimentary IIBA® Member Copy. Not for Distribution or Resale.
             Figure 10.47.1: Use Case Diagram


                                                 System


                              Use Case 3                    Use Case 4



                                    <<extend>>              <<include>>


                                                            Use Case 2
                              Use Case 1                  Extension points:
                                                           Call Use Case 3

             Actor 1                                                               Actor 2


             .2 Use Case Description

             Name

             The use case has a unique name. The name generally includes a verb that
             describes the action taken by the actor and a noun that describes either what is
             being done or the target of the action.

             Goal

             The goal is a brief description of a successful outcome of the use case from the
             perspective of the primary actor. This acts as a summary of the use case.

             Actors

             An actor is any person or system external to the solution that interacts with that
             solution. Each actor is given a unique name that represents the role they play in
             interactions with the solution. Some use case authoring approaches recommend


                                           357
                                                                   Use Cases and Scenarios                                                                               Techniques

                                                                                             against the use of systems or events as actors.
                                                                                             A use case is started by an actor, referred to as the primary actor for that use case.
                                                                                             Other actors who participate in the use case in a supporting role are called
                                                                                             secondary actors.

                                                                                             Preconditions

                                                                                             A precondition is any fact that must be true before the use case can begin. The
                                                                                             precondition is not tested in the use case but acts as a constraint on its execution.

                                                                                             Trigger

                                                                                             A trigger is an event that initiates the flow of events for a use case. The most
                                                                                             common trigger is an action taken by the primary actor.




Complimentary IIBA® Member Copy. Not for Distribution or Resale.
                                                                                             A temporal event (for example, time) can initiate a use case. This is commonly
                                                                                             used to trigger a use case that must be executed based on the time of day or a
                                                                                             specific calendar date, such as an end-of-day routine or an end-of-month
                                                                                             reconciliation of a system.

                                                                                             Flow of Events

                                                                                             The flow of events is the set of steps performed by the actor and the solution
                                                                                             during the execution of the use case. Most use case descriptions separate out a
                                                                                             basic, primary, or main success flow that represents the shortest or simplest
                                                                                             successful path that accomplishes the goal of the actor.
                                                                                             Use cases may also include alternative and exception flows. Alternative flows
                                                                                             describe other paths that may be followed to allow the actor to successfully
                                                                                             achieve the goal of the use case. Exception flows describe the desired response by
                                                                                             the solution when the goal is unachievable and the use case cannot be
                                                                                             successfully completed.

                                                                                             Post-conditions or Guarantees

                                                                                             A post-condition is any fact that must be true when the use case is complete. The
                                                                                             post-conditions must be true for all possible flows through the use case, including
                                                                                             both the primary and alternative flows. The use case may describe separate post-
                                                                                             conditions that are true for successful and unsuccessful executions of the use
                                                                                             case. These can be called guarantees; the success guarantee describes the post-
                                                                                             conditions for success. Minimal guarantees describe the conditions that are
                                                                                             required to be true, even if the actor’s goal is not achieved, and may address
                                                                                             concerns such as security requirements or data integrity.

                                                                      10.47.4                Usage Considerations

                                                                                             .1 Strengths
                                                                                             • Use case diagrams can clarify scope and provide a high-level understanding of
                                                                                               requirements.


                                                                                                                          358
Techniques                                                                              User Stories

             • Use case descriptions are easily understood by stakeholders due to their
               narrative flow.
             • The inclusion of a desired goal or outcome ensures that the business value of
               the use case is articulated.
             • Use case descriptions articulate the functional behaviour of a system.

             .2 Limitations
             • The flexibility of the use case description format may lead to information being
               embedded that would be better captured using other techniques such as user
               interface interactions, non-functional requirements, and business rules.
             • Decisions and the business rules that define them should not be recorded
               directly in use cases, but managed separately and linked from the appropriate




                                                                                                       Complimentary IIBA® Member Copy. Not for Distribution or Resale.
               step.
             • The flexible format of use cases may result in capturing inappropriate or
               unnecessary detail in the attempt to show every step or interaction.
             • Use cases intentionally do not relate to the design of the solution and as a
               result, significant effort may be required in development to map use case steps
               to software architecture.