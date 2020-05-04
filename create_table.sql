create table artshow(
    UID char(24) primary key not null,
    version DOUBLE NOT NULL,
    title text,
    category int not null,
    showUnit text,
    discountInfo text,
    descriptionFilterHtml text,
    imageUrl text,
    masterUnit text,
    subUnit text,
    supportUnit text,
    otherUnit text,
    webSales text,
    sourceWebPromote text,
    comment text,
    editModifyDate text,
    sourceWebName text,
    startDate DATE,
    endDate DATE,
    hitRate int
);



create table showInfo(
    artshowUID char(24),
    `time` DATETIME not null,
    location text not null,
    locationName text not null,
    onSales text not null,
    price text,
    latitude text,
    longitude text,
    endTime text,
    foreign key (artshowUID) references artshow(UID)
);
