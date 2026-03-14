# Technique: Scope Modelling (10.41)

10.41             Scope Modelling
                                                                      10.41.1        Purpose
                                                                                     Scope models define the nature of one or more limits or boundaries and place
                                                                                     elements inside or outside those boundaries.

                                                                      10.41.2        Description
                                                                                     Scope models are commonly used to describe the boundaries of control, change,
                                                                                     a solution, or a need. They may also be used to delimit any simple boundary (as
                                                                                     distinct from horizons, emergent properties, and recursive systems).
                                                                                     These models may show elements that include:




Complimentary IIBA® Member Copy. Not for Distribution or Resale.
                                                                                        • In-scope: the model identifies a boundary as seen from inside, as well as
                                                                                          the elements contained by that boundary (for example, functional
                                                                                          decomposition).
                                                                                        • Out-of-scope: the model identifies a boundary as seen from outside, as
                                                                                          well as the elements that are not contained by that boundary (for example,
                                                                                          context diagram).
                                                                                        • Both: the model identifies a boundary as seen from both sides, as well as
                                                                                          elements on both sides of the boundary (for example, venn diagram or use
                                                                                          case model).
                                                                                     Scope models provide the basis for understanding the boundaries of:
                                                                                        • Scope of Control: what is being analyzed, roles and responsibilities, and
                                                                                          what is internal and external to the organization.
                                                                                        • Scope of Need: stakeholder needs, value to be delivered, functional areas,
                                                                                          and organizational units to be explored.
                                                                                        • Scope of Solution: requirements met, value delivered, and impact of
                                                                                          change.
                                                                                        • Scope of Change: actions to be taken, stakeholders affected or involved,
                                                                                          and events to cause or prevent.
                                                                                     Scope models are typically represented as a combination of diagrams, matrices,
                                                                                     and textual explanations. If the scope is implemented in phases or iterations, the
                                                                                     scope model should be described per each phase or iteration.

                                                                      10.41.3        Elements

                                                                                     .1 Objectives
                                                                                     Scope models are typically used to clarify the:
                                                                                        • span of control,
                                                                                        • relevance of elements, and
                                                                                        • where effort will be applied.


                                                                                                                 338
Techniques                                                                        Scope Modelling

             Depending on the action or stakeholder needs the model supports, a business
             analyst determines the types of models to be used and selects boundaries and
             elements.

             .2 Scope of Change and Context
             Typically, business analysts are concerned with elements that will be altered as
             part of a change, as well as external elements that are relevant to the change. For
             elements inside the scope of change, the business analyst is involved in
             establishing the ways those elements are modified. For elements outside the
             scope of change but relevant to the change, the business analyst is involved in
             establishing the interactions between the change, the current and proposed
             solutions, and the context.
             The business analyst often determines:




                                                                                                    Complimentary IIBA® Member Copy. Not for Distribution or Resale.
                • business processes to be defined or modified,
                • business functions to be added, changed, optimized, or re-assigned,
                • new capabilities to be built or existing capabilities to be changed,
                • external and internal events to be responded to,
                • use cases and situations to be supported,
                • technologies to be changed or replaced,
                • informational assets to be acquired, produced, or processed,
                • stakeholders and organizational roles impacted by the change,
                • external and internal agents and entities impacted by the change,
                • organizations and organizational units (departments, teams, groups)
                  impacted by the change, and
                • systems, components, tools, and physical assets required for the change or
                  impacted by the change.

             .3 Level of Detail
             The purpose of analysis defines the appropriate level of abstraction at which
             scope elements are described. A proper level of detail provides a meaningful
             reduction of uncertainty while preventing 'analysis paralysis' at a scope definition
             stage. The elements of the final scope model can be described by enumerating
             them, by referring to a specific level of their decomposition hierarchy, or by
             grouping them into logically bound sets. For example, a subject of change can be
             defined as a list of specific business processes, as a high-level business process
             encompassing all of them, or as a generic business function. Similarly,
             stakeholders included in the scope can be defined by enumerating specific titles
             or by referring to their common organizational role.




                                         339
                                                                   Scope Modelling                                                                            Techniques

                                                                                     .4 Relationships
                                                                                     Exploring relationships between potential scope elements helps to ensure
                                                                                     completeness and integrity of the scope model by identifying their dependencies
                                                                                     or by discovering other elements involved in or impacted by the change.
                                                                                     Various diagramming techniques are available for exploring relationships of
                                                                                     specific types, including:
                                                                                        • Parent-Child or Composition-Subset: relates elements of the same type
                                                                                          by way of hierarchical decomposition. Relationships of this type appear as
                                                                                          an organization chart, in a class or entity-relationship diagram, as sub-
                                                                                          processes in a business process model, or as composite states on a state
                                                                                          diagram.
                                                                                        • Function-Responsibility: relates a function with the agent (stakeholder,
                                                                                          organizational unit, or solution component) that is responsible for its




Complimentary IIBA® Member Copy. Not for Distribution or Resale.
                                                                                          execution. Relationships of this type appear on business process models and
                                                                                          on collaboration, sequence, and use case diagrams.
                                                                                        • Supplier-Consumer: relates elements by way of the transmission of
                                                                                          information or materials between them. Elements can be processes,
                                                                                          systems, solution components, and organizational units, for both internal
                                                                                          and external entities. Relationships of this type occur in data flow diagrams,
                                                                                          business process models, and in collaboration, sequence, and robustness
                                                                                          diagrams.
                                                                                        • Cause-Effect: relates elements by logical contingency in order to identify
                                                                                          chains of associated elements that are involved in or impacted by the
                                                                                          change. Relationships of this type appear in fishbone (Ishikawa) diagrams
                                                                                          and other cause-effect diagrams.
                                                                                        • Emergent: in most complex systems, several elements can interact to
                                                                                          produce results that cannot be predicted or understood based on the
                                                                                          components alone.

                                                                                     .5 Assumptions
                                                                                     At a time of scope modelling, the validity of the model heavily relies on
                                                                                     assumptions such as the definition of needs, causality of outcomes, impact of
                                                                                     changes, applicability, and feasibility of the solution. The resulting scope model
                                                                                     should include explicit statements of critical assumptions and their implications.

                                                                                     .6 Scope Modelling Results
                                                                                     Results of scope modelling can be represented as:
                                                                                        • textual descriptions of elements, including criteria for making in-scope or
                                                                                          out-of-scope decisions,
                                                                                        • diagrams illustrating relationships of scope elements, and
                                                                                        • matrices depicting dependencies between scope elements.




                                                                                                                 340
Techniques                                                                        Sequence Diagrams

   10.41.4   Usage Considerations

             .1 Strengths
             • A scope model facilitates agreement as a basis for:
             • defining contractual obligations,
             • estimating the project effort,
             • justifying in-scope/out-of-scope decisions in requirements analysis, and
             • assessing the completeness and impact of solutions.

             .2 Limitations
             • An initial, high-level model can lack a sufficient level of granularity, particularly
               for boundary elements, that is needed to ensure clear scope identification.




                                                                                                       Complimentary IIBA® Member Copy. Not for Distribution or Resale.
             • Once a scope is defined, changing it may be difficult due to political reasons
               and contractual obligations. Meanwhile, many factors can affect the scope
               validity before the targets are achieved. Such factors as wrong initial
               assumptions, situation change, evolution of stakeholder needs, or technology
               innovations may cause a need for revising the scope partially or entirely.
             • Traditional scope models cannot address common complex boundaries, such as
               a horizon (a boundary that is completely dependent on the position of the
               stakeholder).