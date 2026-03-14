# Technique: Sequence Diagrams (10.42)

10.42        Sequence Diagrams
   10.42.1   Purpose
             Sequence diagrams are used to model the logic of usage scenarios by showing
             the information passed between objects in the system through the execution of
             the scenario.

   10.42.2   Description
             A sequence diagram shows how processes or objects interact during a scenario.
             The classes required to execute the scenario and the messages they pass to one
             another (triggered by steps in the use case) are displayed on the diagram. The
             sequence diagram shows how objects used in the scenario interact, but not how
             they are related to one another. Sequence diagrams are also often used to show
             how user interface components or software components interact.
             The diagram represents information in a horizontal and vertical alignment. The
             objects that send messages to each other are represented as boxes that are
             aligned at the top of the page from the left to the right, with each object
             occupying a column of space on the page bordered by a vertical line stretching
             down to the bottom of the page. The messages that are sent from one object to


                                           341
                                                                   Sequence Diagrams                                                                           Techniques

                                                                                       the next are represented as horizontal arrows. The order of the messages is
                                                                                       represented in a top-down and left-to-right sequence beginning with the first
                                                                                       message at the top left of the page and subsequent messages occurring to the
                                                                                       right and below. Sequence diagrams are sometimes called event diagrams.
                                                                                       The standard notation for sequence diagrams is defined as part of the Unified
                                                                                       Modelling Language™ (UML®) specification.

                                                                      10.42.3          Elements

                                                                                       .1 Lifeline
                                                                                       A lifeline represents the lifespan of an object during the scenario being modelled
                                                                                       in a sequence diagram. The example below shows the object order. A lifeline is
                                                                                       drawn as a dashed line that vertically descends from each object box to the




Complimentary IIBA® Member Copy. Not for Distribution or Resale.
                                                                                       bottom of the page.

                                                                                       Figure 10.42.1: Lifeline




                                                                                       .2 Activation Box
                                                                                       An activation box represents the period during which an operation is executed. A
                                                                                       call to activate is represented by an arrow with a solid arrowhead leading to the
                                                                                       activation object. The lifeline can be terminated with an X.

                                                                                       Figure 10.42.2: Activation Box




                                                                                       .3 Message
                                                                                       A message is an interaction between two objects. A message is shown as an
                                                                                       arrow coming from the activation box of the object that sends the message to the


                                                                                                                   342
Techniques                                                                                     Sequence Diagrams

             activation box of the object that receives the message.
             The name of the message is placed on top of the arrowed line. There are different
             types of messages:
                  • Synchronous Call: transfers control to the receiving object. The sender
                    cannot act until a return message is received.
                  • Asynchronous Call: (also known as a signal) allows the object to continue
                    with its own processing after sending the signal. The object may send many
                    signals simultaneously, but may only accept one signal at a time.

             Figure 10.42.3: Message

                       Object 1                 Object 2                  Object 3




                                                                                                                   Complimentary IIBA® Member Copy. Not for Distribution or Resale.
                Call
                                  Synchronous
                                    Message
                                                           Asynchronous
                                                             Message
                                   Response
              Execution
             Specification
                                                                             X

               Lifeline                                                          Destruction



   10.42.4   Usage Considerations

             .1 Strengths
             • Shows the interaction between the objects of a system in the chronological
               order that the interactions occur.
             • Shows the interaction between the objects in a visual manner that allows the
               logic to be validated by stakeholders with relative ease.
             • Use cases can be refined into one or more sequence diagrams in order to
               provide added detail and a more in-depth understanding of a business process.

             .2 Limitations
             • Time and effort can be wasted creating a complete set of sequence diagrams
               for each use case of a system, which may not be necessary.
             • Have historically been used for modelling system flows and may be considered
               too technical in other circumstances.




                                                 343
                                                                   Stakeholder List, Map, or Personas                                                                   Techniques