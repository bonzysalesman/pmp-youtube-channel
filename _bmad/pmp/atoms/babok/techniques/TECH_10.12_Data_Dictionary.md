# Technique: Data Dictionary (10.12)

10.12        Data Dictionary
   10.12.1   Purpose
             A data dictionary is used to standardize a definition of a data element and enable
             a common interpretation of data elements.

   10.12.2   Description
             A data dictionary is used to document standard definitions of data elements, their
             meanings, and allowable values. A data dictionary contains definitions of each
             data element and indicates how those elements combine into composite data
             elements. Data dictionaries are used to standardize usage and meanings of data
             elements between solutions and between stakeholders.


                                          247
                                                                   Data Dictionary                                                                            Techniques

                                                                                     Data dictionaries are sometimes referred to as metadata repositories and are used
                                                                                     to manage the data within the context of a solution. As organizations adopt data
                                                                                     mining and more advanced analytics, a data dictionary may provide the metadata
                                                                                     required by these more complex scenarios. A data dictionary is often used in
                                                                                     conjunction with an entity relationship diagram (see Data Modelling (p. 256)) and
                                                                                     may be extracted from a data model.
                                                                                     Data dictionaries can be maintained manually (as a spreadsheet) or via automated
                                                                                     tools.

                                                                                     Figure 10.12.1: Example of a Data Dictionary

                                                                                       Primitive Data       Data Element       Data Element       Data Element
                                                                                          Elements                1                  2                  3




Complimentary IIBA® Member Copy. Not for Distribution or Resale.
                                                                                             Name
                                                                                        Name referenced       First Name        Middle Name          Last Name
                                                                                        by data elements

                                                                                            Alias
                                                                                       Alternate name
                                                                                                              Given Name        Middle Name           Surname
                                                                                        referenced by
                                                                                         stakeholders
                                                                                      Values/Meanings
                                                                                       Enumerated list        Minimum 2                              Minimum 2
                                                                                                                               Can be omitted
                                                                                       or description of      characters                             characters
                                                                                        data element

                                                                                         Description
                                                                                                              First Name        Middle Name         Family Name
                                                                                          Definition


                                                                                         Composite         Customer Name = First Name + Middle Name + Family Name



                                                                       10.12.3       Elements

                                                                                     .1 Data Elements
                                                                                     Data dictionaries describe data element characteristics including the description of
                                                                                     the data element in the form of a definition that will be used by stakeholders. Data
                                                                                     dictionaries include standard definitions of data elements, their meanings, and
                                                                                     allowable values. A data dictionary contains definitions of each primitive data
                                                                                     element and indicates how those elements combine into composite data elements.

                                                                                     .2 Primitive Data Elements
                                                                                     The following information must be recorded about each data element in the data


                                                                                                                  248
Techniques                                                                        Data Dictionary

             dictionary:
                • Name: a unique name for the data element, which will be referenced by
                  the composite data elements.
                • Aliases: alternate names for the data element used by various
                  stakeholders.
                • Values/Meanings: a list of acceptable values for the data element. This
                  may be expressed as an enumerated list or as a description of allowed
                  formats for the data (including information such as the number of
                  characters). If the values are abbreviated this will include an explanation of
                  the meaning.
                • Description: the definition of the data element in the context of the
                  solution.




                                                                                                    Complimentary IIBA® Member Copy. Not for Distribution or Resale.
             .3 Composite Elements
             Composite data elements are built using data elements to build composite
             structures, which may include:
                • Sequences: required ordering of primitive data elements within the
                  composite structure. For example, a plus sign indicates that one element is
                  followed by or concatenated with another element: Customer Name = First
                  Name+Middle Name+Family Name.
                • Repetitions: whether one or more data elements may be repeated
                  multiple times.
                • Optional Elements: may or may not occur in a particular instance of the
                  composite element.

   10.12.4   Usage Considerations

             .1 Strengths
             • Provides all stakeholders with a shared understanding of the format and
               content of relevant information.
             • A single repository of corporate metadata promotes the use of data throughout
               the organization in a consistent manner.

             .2 Limitations
             • Requires regular maintenance, otherwise the metadata could become obsolete
               or incorrect.
             • All maintenance is required to be completed in a consistent manner in order to
               ensure that stakeholders can quickly and easily retrieve the information they
               need. This requires time and effort on the part of the stewards responsible for
               the accuracy and completeness of the data dictionary.
             • Unless care is taken to consider the metadata required by multiple scenarios, it
               may have limited value across the enterprise.


                                         249
                                                                   Data Flow Diagrams                                                                               Techniques