-- Create specific database and use it
create database if not exists cs304;
use cs304;

SET FOREIGN_KEY_CHECKS=0;

-- Drop previous tables
drop table if exists user;
drop table if exists locations;
drop table if exists usercredentials;
drop table if exists member;
drop table if exists forum;
drop table if exists images;
drop table if exists review;
drop table if exists rating;
drop table if exists shows;
drop table if exists comment;
drop table if exists forumcomment;
drop table if exists episodecomment;
drop table if exists reply;
drop table if exists likes;

-- Create new tables and grant privileges
create table locations(
    postalcode char(6),
    province char(20),
    city char(30),
    country char(30),
    primary key (postalcode, country)
);

create table user(
    username char(30),
    firstname char(30),
    lastname char(30),
    country char(30),
    postalcode char(6),
    imageid int default null,
    unique (imageid),
    primary key (username),
    foreign key (postalcode, country) references locations(postalcode, country) on delete set null on update cascade
);

create table usercredentials(
    email char(30),
    passwordhash text,
    salt text,
    role char(30),
    username char(30) not null,
    unique (username),
    primary key (email),
    foreign key (username) references user(username) on delete cascade on update cascade
);

create table forum(
    forumname char(30),
    primary key (forumname)
);

create table member(
    forumname char(30),
    username char(30),
    primary key (forumname, username),
    foreign key (username) references user(username) on delete cascade,
    foreign key (forumname) references forum(forumname) on delete cascade
);

create table rating(
    numericalrating int,
    phraserating char(30),
    primary key (numericalrating)
);

create table shows(
    disneyplusid char(20),
    title char(30),
    primary key (disneyplusid)
);

create table comment(
    commentid int AUTO_INCREMENT,
    timestamp timestamp,
    username char(30) not null,
    msg text,
    primary key (commentid),
    foreign key (username) references user(username) on delete cascade on update cascade
);

create table forumcomment(
    commentid int,
    forumname char(30) not null,
    primary key (commentid),
    foreign key (commentid) references comment(commentid) on delete cascade on update cascade,
    foreign key (forumname) references forum(forumname) on delete cascade on update cascade
);

create table episodecomment(
    commentid int,
    timeinepisode int,
    disneyplusid char(50) not null,
    primary key (commentid),
    foreign key (commentid) references comment(commentid) on delete cascade on update cascade
);

create table reply(
    commentid int,
    replytocommentid int not null,
    primary key (commentid),
    foreign key (replytocommentid) references comment(commentid) on delete cascade on update cascade
);

create table likes(
    commentid int,
    username char(30),
    primary key (commentid, username),
    foreign key (username) references user(username) on delete no action on update cascade
);


create table images(
    imageid int AUTO_INCREMENT,
    name char(30),
    data blob,
    commentid int,
    primary key (imageid),
    foreign key (commentid) references comment(commentid) on delete cascade
);

create table review(
    reviewid int AUTO_INCREMENT,
    timestamp timestamp,
    username char(30) not null,
    disneyplusid char(20) not null,
    content text,
    numericalrating int,
    unique (username, disneyplusid),
    primary key (reviewid),
    foreign key (username) references user(username) on delete cascade on update cascade,
    foreign key (disneyplusid) references shows(disneyplusid) on delete cascade on update cascade,
    foreign key (numericalrating) references rating(numericalrating) on delete cascade on update cascade
);

SET FOREIGN_KEY_CHECKS=1;