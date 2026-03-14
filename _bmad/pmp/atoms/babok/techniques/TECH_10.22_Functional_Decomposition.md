# Technique: Functional Decomposition (10.22)

10.22                     Functional Decomposition
   10.22.1                Purpose
                          Functional decomposition helps manage complexity and reduce uncertainty by
                          breaking down processes, systems, functional areas, or deliverables into their
                          simpler constituent parts and allowing each part to be analyzed independently.

   10.22.2                Description
                          Functional decomposition approaches the analysis of complex systems and
                          concepts by considering them as a set of collaborating or related functions,
                          effects, and components. This isolation helps reduce the complexity of the
                          analysis. Breaking down larger components into sub-components allows scaling,




                                                                                                                                 Complimentary IIBA® Member Copy. Not for Distribution or Resale.
                          tracking, and measuring work effort for each of them. It also facilitates evaluation
                          of the success of each sub-component as it relates to other larger or smaller
                          components.
                          The depth of decomposition may vary depending on the nature of components
                          and objectives. Functional decomposition assumes that sub-components can and
                          do completely describe their parent components. Any sub-component can have
                          only one parent component when developing the functional hierarchy.
                          The diagram below provides an example of how a function can be broken down
                          to manageable, measurable sub-components.

                          Figure 10.22.1: Functional Decomposition Diagram


                                                              Function



                           Subfunction                                                       Subfunction
                                1                                                                 2



        Process 1.1         Process 1.2         Process 1.3          Process 2.1    Process 2.2     Process 2.3   Process 2.4



                Activity 1.1.1      Activity 1.2.1                           Process 2.1.1


                Activity 1.1.2      Activity 1.2.2                           Process 2.2.2


                Activity 1.1.3




                                                              283
                                                                   Functional Decomposition                                                                        Techniques

                                                                      10.22.3             Elements

                                                                                          .1 Decomposition Objectives
                                                                                          Objectives of functional decomposition both drive the process of decomposition
                                                                                          and define what to decompose, how to decompose, and how deeply to
                                                                                          decompose.
                                                                                          The objectives may include:
                                                                                              • Measuring and Managing: to isolate specific manageable factors that
                                                                                                contribute to the overall result, or to identify important metrics and
                                                                                                indicators.
                                                                                              • Designing: to simplify a design problem by reducing and isolating the
                                                                                                object of design.




Complimentary IIBA® Member Copy. Not for Distribution or Resale.
                                                                                              • Analyzing: to study the essential properties and behaviours of an artifact
                                                                                                or phenomenon in isolation from its encompassing environment.
                                                                                              • Estimating and Forecasting: to decrease the level of uncertainty by
                                                                                                breaking down a complex value into its constituent factors.
                                                                                              • Reusing: to create a reusable solution building block that serves a specific
                                                                                                function for various processes.
                                                                                              • Optimization: to detect or alleviate a bottleneck, reduce function cost, or
                                                                                                improve process quality.
                                                                                              • Substitution: to make a specific implementation of a solution component
                                                                                                or a function easily replaceable without impacting the system as a whole.
                                                                                              • Encapsulation: combining elements to make one element.

                                                                                          .2 Subjects of Decomposition
                                                                                          Functional decomposition applies to a wide variety of versatile subjects, such as:
                                                                                              • Business Outcomes: for example, income, profit, expenses, volume of
                                                                                                service, or volume of production.
                                                                                              • Work to be Done: this decomposition (known as a Work Breakdown
                                                                                                Structure or WBS) breaks endeavours into phases, milestones, work
                                                                                                activities, tasks, work items, and deliverables.
                                                                                              • Business Process: to identify its constituent parts for the purposes of
                                                                                                measuring, managing, optimizing, or reusing the process or its
                                                                                                components.
                                                                                              • Function: to enable its optimization or implementation.
                                                                                              • Business Unit: to enable its reverse engineering and design.
                                                                                              • Solution Component: to enable its design, implementation, or change.
                                                                                              • Activity: to enable its implementation, modification, optimization,
                                                                                                measurement, and estimation.
                                                                                              • Products and Services: to design, implement, and improve them.


                                                                                                                        284
Techniques                                                              Functional Decomposition

                • Decisions: for enabling, improving, or supporting them by identifying their
                  inputs, underlying models, dependencies, and outcomes.

             .3 Level of Decomposition
             The appropriate level of functional decomposition defines where, why, and when
             to stop decomposing the subject in order to meet the analysis objectives. The
             process of functional decomposition continues until the business analyst has just
             enough understanding and detail to proceed and can apply the results of
             decomposition in the execution of other tasks.

             .4 Representation of Decomposition Results
             Representations of functional decomposition results allow business analysts to
             both validate and verify the results and to use them to solve other tasks. The
             results can be expressed as a combination of plain textual descriptions,




                                                                                                   Complimentary IIBA® Member Copy. Not for Distribution or Resale.
             hierarchical lists, descriptions using special formal notations (for example,
             mathematical formulas, Business Process Execution Language, or programming
             languages), and visual diagrams. A wide variety of diagramming techniques can
             be used to represent functional decomposition, including:
                • Tree diagrams: represent hierarchical partitioning of work, activities, or
                  deliverables.
                • Nested diagrams: illustrate hierarchical part-to-whole relationships
                  between decomposition results.
                • Use Case diagrams: represent decomposition of a higher-level use case.
                • Flow diagrams: depict results of a process or function decomposition.
                • State Transition diagrams: explain the behaviour of an object inside its
                  composite state.
                • Cause-Effect diagrams: elaborate on events, conditions, activities, and
                  effects involved in producing a complex outcome or phenomenon.
                • Decision Trees: detail the structure of a complex decision and its potential
                  outcomes.
                • Mind Maps: represent information in categories.
                • Component diagram: depicts how components are wired together to
                  form larger components and/or software systems.
                • Decision Model and Notation: is used to analyze the business logic to
                  ensure that it has inferential and business integrity.

   10.22.4   Usage Considerations

             .1 Strengths
             • Makes complex endeavours possible by breaking down complex problems into
               feasible parts.


                                         285
                                                                   Glossary                                                                                 Techniques

                                                                                 • Provides a structured approach to building a shared understanding of complex
                                                                                   matters among a diverse group of stakeholders.
                                                                                 • Simplifies measurement and estimation of the amount of work involved in
                                                                                   pursuing a course of action, defining scope of work, and defining process
                                                                                   metrics and indicators.

                                                                                 .2 Limitations
                                                                                 • Missing or incorrect information at the time decomposition is performed may
                                                                                   later cause a need to revise the results of decomposition partially or entirely.
                                                                                 • Many systems cannot be fully represented by simple hierarchical relationships
                                                                                   between components because the interactions between components cause
                                                                                   emergent characteristics and behaviours.
                                                                                 • Every complex subject allows multiple alternative decompositions. Exploring all




Complimentary IIBA® Member Copy. Not for Distribution or Resale.
                                                                                   alternatives can be a challenging and time-consuming task, while sticking with
                                                                                   a single alternative may disregard important opportunities and result in a sub-
                                                                                   optimal solution.
                                                                                 • Performing functional decomposition may involve deep knowledge of the
                                                                                   subject and extensive collaboration with diverse stakeholders.