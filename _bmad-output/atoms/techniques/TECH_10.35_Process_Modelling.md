# Technique: Process Modelling (10.35)

10.35               Process Modelling
                                                                      10.35.1          Purpose
                                                                                       Process modelling is a standardized graphical model used to show how work is
                                                                                       carried out and is a foundation for process analysis.

                                                                      10.35.2          Description
                                                                                       Process models describe the sequential flow of work or activities. A business
                                                                                       process model describes the sequential flow of work across defined tasks and
                                                                                       activities through an enterprise or part of an enterprise. A system process model
                                                                                       defines the sequential flow of control among programs or units within a
                                                                                       computer system. A program process flow shows the sequential execution of




Complimentary IIBA® Member Copy. Not for Distribution or Resale.
                                                                                       program statements within a software program. A process model can also be
                                                                                       used in documenting operational procedures.
                                                                                       A process model can be constructed on multiple levels, each of which can be
                                                                                       aligned to different stakeholder points of view. These levels exist to progressively
                                                                                       decompose a complex process into component processes, with each level
                                                                                       providing increasing detail and precision. At a high (enterprise or context) level,
                                                                                       the model provides a general understanding of a process and its relationship to
                                                                                       other processes. At lower (operational) levels, it can define more granular
                                                                                       activities and identify all outcomes, including exceptions and alternative paths. At
                                                                                       the lowest (system) level, the model can be used as a basis for simulation or
                                                                                       execution.
                                                                                       Process models can be used to:
                                                                                          • describe the context of the solution or part of the solution,
                                                                                          • describe what actually happens, or is desired to happen, during a process,
                                                                                          • provide an understandable description of a sequence of activities to an
                                                                                            external observer,
                                                                                          • provide a visual to accompany a text description, and
                                                                                          • provide a basis for process analysis.
                                                                                       The business analyst can use a process model to define the current state of a
                                                                                       process (also known as an as-is model) or a potential future state (also known as
                                                                                       a to-be model). A model of the current state can provide understanding and
                                                                                       agreement as to what happens now. A model of the future state can provide
                                                                                       alignment with what is desired to happen in the future.
                                                                                       Process models generally include:
                                                                                          • the participants in the process,
                                                                                          • the business event that triggers the process,
                                                                                          • the steps or activities of the process (both manual and automated),
                                                                                          • the paths (flows) and decision points that logically link those activities, and


                                                                                                                   318
Techniques                                                                     Process Modelling

                • the results of the process.
             The most basic process model includes: a trigger event, a sequence of activities,
             and a result.
             A more comprehensive process model can include other elements, such as data/
             materials, inputs and outputs, and call-out descriptions that supplement the
             graphical representation.

   10.35.3   Elements

             .1 Types of Process Models and Notations
             Many different notations are used in process modelling.
             The most commonly used notations include the following:




                                                                                                   Complimentary IIBA® Member Copy. Not for Distribution or Resale.
                • Flowcharts and Value Stream Mapping (VSM): used in the business
                  domain.
                • Data Flow diagrams and Unified Modelling Language™ (UML®)
                  diagrams: used in the information technology domain.
                • Business Process Model and Notation (BPMN): used across both
                  business and information technology domains; is increasingly adopted as an
                  industry standard.
                • Integrated DEFinition (IDEF) notation and Input, Guide, Output,
                  Enabler (IGOE) diagrams: used for establishing scope.
                • SIPOC and Value Stream Analysis: used for process modelling.
             Process models typically contain some or all of the following key elements:
                • Activity: an individual step or piece of work that forms part of the business
                  process. It may be a single task or may be further decomposed into a sub-
                  process (with its own activities, flow, and other process elements).
                • Event: a zero-time occurrence which initiates, interrupts, or terminates an
                  activity or task within a process or the process itself. It may be a message
                  received, the passage of time, or the occurrence of a condition as defined in
                  the business rules.
                • Directional Flow: a path that indicates the logical sequence of the
                  workflow. In general, diagrams are drawn to show the passage of time in a
                  consistent fashion (typically in the direction that text would be read).
                • Decision Point: a point in the process where the flow of work splits into
                  two or more flows (paths), which may be mutually exclusive alternatives or
                  parallels. A decision can also be used to locate rules where separate flows
                  merge together.
                • Link: a connection to other process maps.
                • Role: a type of person or group involved in the process. Its definitions
                  typically match those in the organizational model.


                                         319
                                                                   Process Modelling                                                                                             Techniques

                                                                                       Flowchart

                                                                                       Flowcharts are used commonly with non-technical audiences and are good for
                                                                                       gaining both alignment with what the process is and context for a solution. A
                                                                                       flowchart can be simple, displaying just the sequence of activities, or it can be
                                                                                       more comprehensive, using swimlanes. A swimlane is a partitioned area
                                                                                       (horizontal or vertical) that segregates those activities in the process that are
                                                                                       carried out by a particular role.

                                                                                       Figure 10.35.1: Flowchart

                                                                                                          Swimlane for Role 1                           Swimlane for Role 2



                                                                                                                    Start




Complimentary IIBA® Member Copy. Not for Distribution or Resale.
                                                                                                                                              The flow of work splits.
                                                                                                                   Task 1                     Tasks are executed in
                                                                                                                                              parallel.



                                                                                             Task 2A                                Task 2B




                                                                                                               Input/Output



                                                                                           Flow merge
                                                                                           into a task.

                                                                                                                                                              Sub-Process



                                                                                                                   False
                                                                                             Decision                                Task 3


                                                                                            True

                                                                                                                                                        A sub-process embeds
                                                                                                   Stop
                                                                                                                                                        another process model.


                                                                                                   Swimlanes are an unofficial, but common,
                                                                                                   extension to the flowcharting standard.




                                                                                       Business Process Model and Notation (BPMN)

                                                                                       Business Process Model and Notation (BPMN) provides an industry-standard
                                                                                       language for modelling business processes in a form that is accessible by both
                                                                                       business users and technical developers. BPMN is designed to cover many types of
                                                                                       modelling, including both internal (private) processes and collaborative (public)
                                                                                       processes. It can be the input to process automation technologies.
                                                                                       A key feature of BPMN is its ability to distinguish the activities of different
                                                                                       participants in a process with pools and swimlanes. When the flow of work
                                                                                       crosses the boundary of a swimlane, responsibility for the work then passes to


                                                                                                                                      320
Techniques                                                                                           Process Modelling

             another role within the organization. Swimlanes are part of a pool. A pool is a
             self-regulating (free-standing) business entity, typically an organization or a
             system. A pool may include a number of swimlanes, each of which represents a
             role. Commonly, a process includes one pool for the customer and a second pool
             for the organization under study, although it is possible for a process to include
             any number of pools.

             Figure 10.35.2: Business Process Model and Notation

                                            Lane 1                               Lane 2


                                                     Start Event




                                                                                                                         Complimentary IIBA® Member Copy. Not for Distribution or Resale.
                                            Task 1

                                                                          The flow of work splits.
                                                                          Tasks are executed in
                                                                          parallel.
                           Parallel Split




                     Task 2A                                  Task 2B



                                                                          The flow of work
                           Parallel Join
                                                                          merges. The join must
                                                                          be explicit.

                                         *nput/Output
                                             Task


                                                                              Sub-Process
                   Data Store

                           Sub-process
                           successful?       X                   Task 3



               Exclusive Gateway. The                                     A sub-process embeds
                                                                          another process model.
               decision is not made at               End Event
               the gateway. It is made
               in a preceding task.



             Activity Diagram

             The activity diagram is one of the use case realization diagrams defined in the
             Unified Modelling Language™ (UML®). Originally designed to elaborate on a
             single use case, the activity diagram has been adopted for more general process
             modelling purposes, including business process modelling. While similar in
             appearance to a flowchart, the activity diagram typically employs swimlanes to
             show responsibilities, synchronization bars to show parallel processing, and
             multiple exit decision points.




                                                           321
                                                                   Process Modelling                                                                                          Techniques

                                                                                       Figure 10.35.3: Activity Diagram

                                                                                                         Partition for Role 1                       Partition for Role 2




                                                                                                                                          The flow of work splits.
                                                                                                                 Task 1                   Tasks are executed in
                                                                                                                                          parallel.




                                                                                               Task 2A                          Task 2B




Complimentary IIBA® Member Copy. Not for Distribution or Resale.
                                                                                                                                            Flow merges.


                                                                                                               Task (I/O)


                                                                                         Decision

                                                                                                                                                           Sub-Process


                                                                                                              [False]
                                                                                                                                Task 3


                                                                                            [True]

                                                                                                                                                     A sub-process embeds
                                                                                                                                                     another process model.




                                                                      10.35.4          Usage Considerations

                                                                                       .1 Strengths
                                                                                       • Appeals to the basic human understanding of sequential activities.
                                                                                       • Most stakeholders are comfortable with the concepts and basic elements of a
                                                                                         process model.
                                                                                       • The use of levels can accommodate the different perspectives of various
                                                                                         stakeholder groups.
                                                                                       • Effective at showing how to handle a large number of scenarios and parallel
                                                                                         branches.
                                                                                       • Can help identify any stakeholder groups that may have otherwise been
                                                                                         overlooked.
                                                                                       • Facilitates the identification of potential improvements by highlighting “pain
                                                                                         points” in the process structure (i.e. process visualization).


                                                                                                                                322
Techniques                                                                            Prototyping

             • Likely to have value in its own right. They provide documentation for
               compliance purposes and can be used by business stakeholders for training and
               coordination of activities.
             • Can be used as a baseline for continuous improvement.
             • Ensures labelling consistency across artifacts.
             • Provides transparency and clarity to process owners and participants on activity
               responsibilities, sequence and hand-overs.

             .2 Limitations
             • To many people in IT, a formal process model tends to reflect an older and more
               document-heavy approach to software development. Therefore, project time is
               not allocated to developing a process model, especially of the current state or
               problem domain.




                                                                                                    Complimentary IIBA® Member Copy. Not for Distribution or Resale.
             • Can become extremely complex and unwieldy if not structured carefully. This is
               especially true if business rules and decisions are not managed separately from
               the process.
             • Complex processes can involve many activities and roles; this can make them
               almost impossible for a single individual to understand and ‘sign off’.
             • Problems in a process cannot always be identified by looking at a high-level
               model. A more detailed model with reference to metadata (such as path
               frequency, cost, and time factors) is usually required. It is often necessary to
               engage with stakeholders directly to find the operational problems they have
               encountered while working with a process.
             • In a highly dynamic environment where things change quickly, process models
               can become obsolete.
             • May prove difficult to maintain if the process model only serves as
               documentation, as stakeholders may alter the process to meet their needs
               without updating the model.