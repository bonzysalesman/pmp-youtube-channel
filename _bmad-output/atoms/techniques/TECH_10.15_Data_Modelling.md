# Technique: Data Modelling (10.15)

10.15            Data Modelling
                                                                      10.15.1       Purpose
                                                                                    A data model describes the entities, classes or data objects relevant to a domain,
                                                                                    the attributes that are used to describe them, and the relationships among them
                                                                                    to provide a common set of semantics for analysis and implementation.

                                                                      10.15.2       Description
                                                                                    A data model usually takes the form of a diagram that is supported by textual
                                                                                    descriptions. It visually represents the elements that are important to the business
                                                                                    (for example, people, places, things, and business transactions), the attributes
                                                                                    associated with those elements, and the significant relationships among them.
                                                                                    Data models are frequently used in elicitation and requirements analysis and
                                                                                    design, as well as to support implementation and continuous improvement.
                                                                                    There are several variations of data models:
                                                                                       • Conceptual data model: is independent of any solution or technology
                                                                                         and can be used to represent how the business perceives its information. It
                                                                                         can be used to help establish a consistent vocabulary describing business


                                                                                                                256
Techniques                                                                          Data Modelling

                  information and the relationships within that information.
                • Logical data model: is an abstraction of the conceptual data model that
                  incorporates rules of normalization to formally manage the integrity of the
                  data and relationships. It is associated with the design of a solution.
                • Physical data model: is used by implementation subject matter experts to
                  describe how a database is physically organized. It addresses concerns like
                  performance, concurrency, and security.
             The conceptual, logical, and physical data models are developed for different
             purposes and may be significantly different even when depicting the same
             domain.
             At the conceptual level, different data modelling notations are likely to produce
             broadly similar results and can be thought of as a single technique (as presented




                                                                                                     Complimentary IIBA® Member Copy. Not for Distribution or Resale.
             here). Logical and physical data models include elements specific to the solutions
             they support, and are generally developed by stakeholders with expertise in
             implementing particular technical solutions. For instance, logical and physical
             entity-relationship diagrams (ERDs) would be used to implement a relational
             database, whereas a logical or physical class diagram would be used to support
             object-oriented software development.
             Object diagrams can be used to illustrate particular instances of entities from a
             data model. They can include actual sample values for the attributes, making
             object diagrams more concrete and more easily understood.

   10.15.3   Elements

             .1 Entity or Class
             In a data model, the organization keeps data on entities (or classes or data
             objects). An entity may represent something physical (such as a Warehouse),
             something organizational (such as a Sales Area), something abstract (such as a
             Product Line), or an event (such as an Appointment). An entity contains attributes
             and has relationships to other entities in the model.
             In a class diagram, entities are referred to as classes. Like an entity in a data
             model, a class contains attributes and has relationships with other classes. A class
             also contains operations or functions that describe what can be done with the
             class, such as generating an invoice or opening a bank account.
             Each instance of an entity or class will have a unique identifier that sets it apart
             from other instances.

             .2 Attribute
             An attribute defines a particular piece of information associated with an entity,
             including how much information can be captured in it, its allowable values, and
             the type of information it represents. Attributes can be described in a data
             dictionary (see Data Dictionary (p. 247)). Allowable values may be specified
             through business rules (see Business Rules Analysis (p. 240)).


                                          257
                                                                   Data Modelling                                                                            Techniques

                                                                                    Attributes can include such values as:
                                                                                       • Name: a unique name for the attribute. Other names used by stakeholders
                                                                                         may be captured as aliases.
                                                                                       • Values/Meanings: a list of acceptable values for the attribute. This may be
                                                                                         expressed as an enumerated list or as a description of allowed formats for
                                                                                         the data (including information such as the number of characters). If the
                                                                                         values are abbreviated this will include an explanation of the meaning.
                                                                                       • Description: the definition of the attribute in the context of the solution.

                                                                                    .3 Relationship or Association
                                                                                    The relationships between entities provide structure for the data model,
                                                                                    specifically indicating which entities relate to which others and how.
                                                                                    Specifications for a relationship typically indicate the number of minimum and




Complimentary IIBA® Member Copy. Not for Distribution or Resale.
                                                                                    maximum occurrences allowed on each side of that relationship (for example,
                                                                                    every customer is related to exactly one sales area, while a sales area may be
                                                                                    related to zero, one, or many customers). The term cardinality is used to refer to
                                                                                    the minimum and maximum number of occurrences to which an entity may be
                                                                                    related. Typical cardinality values are zero, one, and many.
                                                                                    The relationship between two entities may be read in either direction, using this
                                                                                    format:
                                                                                       Each occurrence (of this entity) is related to (minimum, maximum) (of this
                                                                                       other entity).

                                                                                    In a class model, the term association is used instead of relationship and
                                                                                    multiplicity is used instead of cardinality.

                                                                                    .4 Diagrams
                                                                                    Both data models and class models may have one or more diagrams that show
                                                                                    entities, attributes, and relationships.
                                                                                    The diagram in a data model is called an entity-relationship diagram (ERD). In a
                                                                                    class model, the diagram is called a class diagram.




                                                                                                                258
Techniques                                                                                                 Data Modelling

             Figure 10.15.1: Entity-Relationship Diagram (Crow's Foot Notation)


                  Each entity is shown as a                                             The unique identifier of the
                  rectangle with the entity                                             entity is shown under the
                  name.                                                                 entity name.



                           Entity 1                    relationship left to right                 Entity 2
                    Unique Identifier                                                     Unique Identifier
                    Attribute                          relationship right to left         Attribute




                                                                                                                            Complimentary IIBA® Member Copy. Not for Distribution or Resale.
                           Entity 3                                                               Entity 4
                    Unique Identifier                                                      Unique Identifier

                    Attribute 1
                    Attribute 2                                                            Attribute




                  The attributes of the entity                                          Relationships are indicated by
                  are listed below the unique                                           a line, which is annotated to
                  identifier.                                                           show cardinality.



                                                            Cardinality

                            Entity                     Entity                       Entity                      Entity
                       Any number (zero            Zero to One                      Only One                  Any number
                           to many)                                                                           from one to
                                                                                                                 many




                                                 259
                                                                   Data Modelling                                                                                                           Techniques

                                                                                    Figure 10.15.2: Class Diagram (UML®)



                                                                                      The name of the class is listed here. It                                Relationships are indicated
                                                                                      may optionally have a stereotype which                                  by a line, which may also show
                                                                                      defines additional properties.                                          multiplicity.




                                                                                                   <<stereotype>>                                                       Class 2
                                                                                                        Class 1
                                                                                                                                                                Attribute 1
                                                                                              Attribute 1: Attribute Type         1                   0..*      Attribute 2
                                                                                              Attribute 2: Attribute Type                                       Attribute 3
                                                                                                                                                                Attribute 4




Complimentary IIBA® Member Copy. Not for Distribution or Resale.
                                                                                              Operation 1
                                                                                              Operation 2
                                                                                              Operation 3

                                                                                                                                                              The attributes of the class are
                                                                                                                                                              listed in a box below the name.
                                                                                                                                                              Operations are listed below the
                                                                                                                                                              attributes.

                                                                                                                                      Multiplicity

                                                                                          *        Class             X        Class            X..Y          Class            1..*       Class
                                                                                                 Any number              Must be exactly X              Any number                   Any number from
                                                                                                (zero to many)                                          from X to Y                    one to many




                                                                                    .5 Metadata
                                                                                    A data model optionally contains metadata describing what the entities
                                                                                    represent, when and why they were created or changed, how they should be
                                                                                    used, how often they are used, when, and by whom. There could be restrictions
                                                                                    on their creation or use, as well as security, privacy, and audit constraints on
                                                                                    specific entities or whole groups of entities.

                                                                      10.15.4       Usage Considerations

                                                                                    .1 Strengths
                                                                                    • Can be used to define and communicate a consistent vocabulary used by
                                                                                      domain subject matter experts and implementation subject matter experts.
                                                                                    • Review of a logical data model helps to ensure that the logical design of
                                                                                      persistent data correctly represents the business need.
                                                                                    • Provides a consistent approach to analyzing and documenting data and its
                                                                                      relationships.


                                                                                                                            260
Techniques                                                                         Decision Analysis

             • Offers the flexibility of different levels of detail, which provides just enough
               information for the respective audience.
             • Formal modelling of the information held by the business may expose new
               requirements as inconsistencies are identified.

             .2 Limitations
             • Following data modelling standards too rigorously may lead to models that are
               unfamiliar to people without a background in IT.
             • May extend across multiple functional areas of the organization, and so beyond
               the business knowledge base of individual stakeholders.