# Technique: Decision Modelling (10.17)

10.17        Decision Modelling
   10.17.1   Purpose
             Decision modelling shows how repeatable business decisions are made.

   10.17.2   Description
             Decision models show how data and knowledge are combined to make a specific




                                                                                                    Complimentary IIBA® Member Copy. Not for Distribution or Resale.
             decision. Decision models can be used for both straightforward and complex
             decisions. Straightforward decision models use a single decision table or decision
             tree to show how a set of business rules that operate on a common set of data
             elements combine to create a decision. Complex decision models break down
             decisions into their individual components so that each piece of the decision can
             be separately described and the model can show how those pieces combine to
             make an overall decision. The information that needs to be available to make the
             decision and any sub-decisions can be decomposed. Each sub-decision is
             described in terms of the business rules required to make that part of the
             decision.
             A comprehensive decision model is an overarching model that is linked to
             processes, performance measures, and organizations. It shows where the
             business rules come from and represents decisions as analytical insight.
             The business rules involved in a given decision may be definitional or behavioural.
             For instance, a decision 'Validate order' might check that the tax amount is
             calculated correctly (a definitional rule) and that the billing address matches the
             credit card provided (a behavioural rule).
             Decision tables and decision trees define how a specific decision is made. A
             graphical decision model can be constructed at various levels. A high-level model
             may only show the business decisions as they appear in business processes, while
             a more detailed model might show as-is or to-be decision making in enough
             detail to act as a structure for all the relevant business rules.

   10.17.3   Elements

             .1 Types of Models and Notations
             There are several different approaches to decision modelling. Decision tables
             represent all the rules required to make an atomic decision. Decision trees are
             common in some industries, but are generally used much less often than decision
             tables. Complex decisions require the combination of multiple simple decisions
             into a network. This is shown using dependency or requirements notations.


                                         265
                                                                   Decision Modelling                                                                               Techniques

                                                                                        All of these approaches involve three key elements:
                                                                                           • decision,
                                                                                           • information, and
                                                                                           • knowledge.

                                                                                        Decision Tables

                                                                                        Business decisions use a specific set of input values to determine a particular
                                                                                        outcome by using a defined set of business rules to select one from the available
                                                                                        outcomes. A decision table is a compact, tabular representation of a set of these
                                                                                        rules. Each row (or column) is a rule and each column (or row) represents one of
                                                                                        the conditions of that rule. When all the conditions in a particular rule evaluate to
                                                                                        true for a set of input data, the outcome or action specified for that rule is
                                                                                        selected.




Complimentary IIBA® Member Copy. Not for Distribution or Resale.
                                                                                        Decision tables generally contain one or more condition columns that map to
                                                                                        specific data elements, as well as one or more action or outcome columns. Each
                                                                                        row can contain a specific condition in each condition column. These are
                                                                                        evaluated against the value of the data element being considered. If all the cells in
                                                                                        a rule are either blank or evaluate to true, the rule is true and the result specified
                                                                                        in the action or outcome column occurs.

                                                                                        Figure 10.17.1: Decision Table

                                                                                         Eligibility Rules

                                                                                           Loan Amount              Age              Eligibility

                                                                                                                    >18               Eligible
                                                                                              <=1000
                                                                                                                   <=18              Ineligible
                                                                                                                    >21               Eligible
                                                                                             1000–2000
                                                                                                                   <=21              Ineligible
                                                                                                                   >=25               Eligible
                                                                                               >2000
                                                                                                                    <25              Ineligible


                                                                                        Decision Trees

                                                                                        Decision trees are also used to represent a set of business rules. Each path on a
                                                                                        decision tree leaf node is a single rule. Each level in the tree represents a specific
                                                                                        data element; the downstream branches represent the different conditions that
                                                                                        must be true to continue down that branch. Decision trees can be very effective
                                                                                        for representing certain kinds of rule sets, especially those relating to customer
                                                                                        segmentation.
                                                                                        As with decision tables, a decision tree selects one of the available actions or
                                                                                        outcomes (a leaf node shown on the far right or bottom of the tree) based on the


                                                                                                                     266
Techniques                                                                     Decision Modelling

             specific values passed to it by the data elements that represent the branching
             nodes.
             In the following decision tree, the rules in the tree share conditions (represented
             by earlier nodes in the tree).

             Figure 10.17.2: Decision Tree

                                                                            Eligible
                                                               >18
                                                 Age          <=18
                                                                           Ineligible
                                       0
                                    100
                               <=
                                                                            Eligible
               Amount        1000-2000           Age           >2 1
                                                              <=21
                                                                           Ineligible
                               >2
                                  00
                                     0
                                                                            Eligible




                                                                                                    Complimentary IIBA® Member Copy. Not for Distribution or Resale.
                                                 Age          >=25
                                                              <25
                                                                           Ineligible


             Decision Requirements Diagrams

             A decision requirements diagram is a visual representation of the information,
             knowledge, and decision making involved in a more complex business decision.
             Decision requirement diagrams contain the following elements:
                • Decisions: shown as rectangles. Each decision takes a set of inputs and
                  selects from a defined set of possible outputs by applying business rules and
                  other decision logic.
                • Input Data: shown as ovals, representing data that must be passed as an
                  input to a decision on the diagram.
                • Business Knowledge Models: shown as a rectangle with the corners cut
                  off, representing sets of business rules, decision tables, decision trees, or
                  even predictive analytic models that describe precisely how to make a
                  decision.
                • Knowledge Sources: shown as a document, representing the original
                  source documents or people from which the necessary decision logic can be
                  or has been derived.
             These nodes are linked together into a network to show the decomposition of
             complex decision making into simpler building blocks. Solid arrows show the
             information requirements for a decision. These information requirements might
             link input data to a decision, to show that this decision requires that data to be
             available, or might link two decisions together.
             Business knowledge models which describe how to make a specific decision can
             be linked to that decision with dashed arrows to display knowledge requirements.
             Knowledge sources can be linked to decisions with a dashed, rounded arrow to
             show that a knowledge source (for example, a document or person) is an
             authority for the decision. This is called an authority requirement.


                                           267
                                                                   Decision Modelling                                                                           Techniques

                                                                                        Figure 10.17.3: Decision Requirements Diagram

                                                                                          Knowledge
                                                                                            Source


                                                                                                           Business
                                                                                                                                   Decision
                                                                                                          Knowledge



                                                                                               Business
                                                                                                                       Decision               Input Data
                                                                                              Knowledge




Complimentary IIBA® Member Copy. Not for Distribution or Resale.
                                                                                                                      Input Data



                                                                      10.17.4           Usage Considerations

                                                                                        .1 Strengths
                                                                                        • Decision models are easy to share with stakeholders, facilitate a shared
                                                                                          understanding, and support impact analysis.
                                                                                        • Multiple perspectives can be shared and combined, especially when a diagram
                                                                                          is used.
                                                                                        • Simplifies complex decision making by removing business rules management
                                                                                          from the process.
                                                                                        • Assists with managing large numbers of rules in decision tables by grouping
                                                                                          rules by decision. This also helps with reuse.
                                                                                        • These models work for rules-based automation, data mining, and predictive
                                                                                          analytics, as well as for manual decisions or business intelligence projects.

                                                                                        .2 Limitations
                                                                                        • Adds a second diagram style when modelling business processes that contain
                                                                                          decisions.This may add unnecessary complexity if the decision is simple and
                                                                                          tightly coupled with the process.
                                                                                        • May limit rules to those required by known decisions and so limit the capture of
                                                                                          rules not related to a known decision.
                                                                                        • Defining decision models may allow an organization to think it has a standard
                                                                                          way of making decisions when it does not. May lock an organization into a
                                                                                          current-state decision-making approach.
                                                                                        • Cuts across organizational boundaries, which can make it difficult to acquire
                                                                                          any necessary sign-off.
                                                                                        • May not address behavioural business rules in a direct fashion.


                                                                                                                    268
Techniques                                                                       Document Analysis

             • Business terminology must be clearly defined and shared definitions developed
               to avoid data quality issues affecting automated decisions.