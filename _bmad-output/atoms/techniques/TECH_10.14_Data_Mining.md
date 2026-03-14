# Technique: Data Mining (10.14)

10.14        Data Mining
   10.14.1   Purpose
             Data mining is used to improve decision making by finding useful patterns and
             insights from data.

   10.14.2   Description
             Data mining is an analytic process that examines large amounts of data from
             different perspectives and summarizes the data in such a way that useful patterns
             and relationships are discovered.
             The results of data mining techniques are generally mathematical models or
             equations that describe underlying patterns and relationships. These models can
             be deployed for human decision making through visual dashboards and reports,
             or for automated decision-making systems through business rule management
             systems or in-database deployments.


                                          253
                                                                   Data Mining                                                                                   Techniques

                                                                                 Data mining can be utilized in either supervised or unsupervised investigations. In
                                                                                 a supervised investigation, users can pose a question and expect an answer that
                                                                                 can drive their decision making. An unsupervised investigation is a pure pattern
                                                                                 discovery exercise where patterns are allowed to emerge, and then considered for
                                                                                 applicability to business decisions.
                                                                                 Data mining is a general term that covers descriptive, diagnostic, and predictive
                                                                                 techniques:
                                                                                     • Descriptive: such as clustering make it easier to see the patterns in a set of
                                                                                       data, such as similarities between customers.
                                                                                     • Diagnostic: such as decision trees or segmentation can show why a
                                                                                       pattern exists, such as the characteristics of an organization's most
                                                                                       profitable customers.
                                                                                     • Predictive: such as regression or neural networks can show how likely




Complimentary IIBA® Member Copy. Not for Distribution or Resale.
                                                                                       something is to be true in the future, such as predicting the probability that
                                                                                       a particular claim is fraudulent.
                                                                                 In all cases it is important to consider the goal of the data mining exercise and to
                                                                                 be prepared for considerable effort in securing the right type, volume, and quality
                                                                                 of data with which to work.

                                                                      10.14.3    Elements

                                                                                 .1 Requirements Elicitation
                                                                                 The goal and scope of data mining is established either in terms of decision
                                                                                 requirements for an important identified business decision, or in terms of a
                                                                                 functional area where relevant data will be mined for domain-specific pattern
                                                                                 discovery. This top-down versus a bottom-up mining strategy allows analysts to
                                                                                 pick the correct set of data mining techniques.
                                                                                 Formal decision modelling techniques (see Decision Modelling (p. 265)) are used
                                                                                 to define requirements for top-down data mining exercises. For bottom-up
                                                                                 pattern discovery exercises it is useful if the discovered insight can be placed on
                                                                                 existing decision models, allowing rapid use and deployment of the insight.
                                                                                 Data mining exercises are productive when managed as an agile environment.
                                                                                 They assist rapid iteration, confirmation, and deployment while providing project
                                                                                 controls.

                                                                                 .2 Data Preparation: Analytical Dataset
                                                                                 Data mining tools work on an analytical dataset. This is generally formed by
                                                                                 merging records from multiple tables or sources into a single, wide dataset.
                                                                                 Repeating groups are typically collapsed into multiple sets of fields. The data may
                                                                                 be physically extracted into an actual file or it may be a virtual file that is left in the
                                                                                 database or data warehouse so it can be analyzed. Analytical datasets are split
                                                                                 into a set to be used for analysis, a completely independent set for confirming
                                                                                 that the model developed works on data not used to develop it, and a validation
                                                                                 set for final confirmation. Data volumes can be very large, sometimes resulting in


                                                                                                                254
Techniques                                                                              Data Mining

             the need to work with samples or to work in-datastore so that the data does not
             have to be moved around.

             .3 Data Analysis
             Once the data is available, it is analyzed. A wide variety of statistical measures are
             typically applied and visualization tools used to see how data values are
             distributed, what data is missing, and how various calculated characteristics
             behave. This step is often the longest and most complex in a data mining effort
             and is increasingly the focus of automation. Much of the power of a data mining
             effort typically comes from identifying useful characteristics in the data. For
             instance, a characteristic might be the number of times a customer has visited a
             store in the last 80 days. Determining that the count over the last 80 days is more
             useful than the count over the last 70 or 90 is key.




                                                                                                      Complimentary IIBA® Member Copy. Not for Distribution or Resale.
             .4 Modelling Techniques
             There are a wide variety of data mining techniques.
             Some examples of data mining techniques are:
                • classification and regression trees (CART), C5 and other decision tree
                  analysis techniques,
                • linear and logistic regression,
                • neural networks,
                • support sector machines, and
                • predictive (additive) scorecards.
             The analytical dataset and the calculated characteristics are fed into these
             algorithms which are either unsupervised (the user does not know what they are
             looking for) or supervised (the user is trying to find or predict something specific).
             Multiple techniques are often used to see which is most effective. Some data is
             held out from the modelling and used to confirm that the result can be replicated
             with data that was not used in the initial creation.

             .5 Deployment
             Once a model has been built, it must be deployed to be useful. Data mining
             models can be deployed in a variety of ways, either to support a human decision
             maker or to support automated decision-making systems. For human users, data
             mining results may be presented using visual metaphors or as simple data fields.
             Many data mining techniques identify potential business rules that can be
             deployed using a business rules management system. Such executable business
             rules can be fitted into a decision model along with expert rules as necessary.
             Some data mining techniques—especially those described as predictive analytic
             techniques—result in mathematical formulas. These can also be deployed as
             executable business rules but can also be used to generate SQL or code for
             deployment. An increasingly wide range of in-database deployment options allow
             such models to be integrated into an organization's data infrastructure.


                                          255
                                                                   Data Modelling                                                                             Techniques

                                                                      10.14.4       Usage Considerations

                                                                                    .1 Strengths
                                                                                    • Reveal hidden patterns and create useful insight during analysis—helping
                                                                                      determine what data might be useful to capture or how many people might be
                                                                                      impacted by specific suggestions.
                                                                                    • Can be integrated into a system design to increase the accuracy of the data.
                                                                                    • Can be used to eliminate or reduce human bias by using the data to determine
                                                                                      the facts.

                                                                                    .2 Limitations
                                                                                    • Applying some techniques without an understanding of how they work can




Complimentary IIBA® Member Copy. Not for Distribution or Resale.
                                                                                      result in erroneous correlations and misapplied insight.
                                                                                    • Access to big data and to sophisticated data mining tool sets and software may
                                                                                      lead to accidental misuse.
                                                                                    • Many techniques and tools require specialist knowledge to work with.
                                                                                    • Some techniques use advanced math in the background and some
                                                                                      stakeholders may not have direct insights into the results. A perceived lack of
                                                                                      transparency can cause resistance from some stakeholders.
                                                                                    • Data mining results may be hard to deploy if the decision making they are
                                                                                      intended to influence is poorly understood.