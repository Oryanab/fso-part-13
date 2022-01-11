CREATE TABLE blogs (id SERIAL PRIMARY KEY NOT NULL, author text NOT NULL, url text  NOT NULL, title text NOT NULL, likes INT DEFAULT 0);

id (unique, incrementing id)
author (string)
url (string that cannot be empty)
title (string that cannot be empty)
likes (integer with default value zero)

insert into blogs (author, url, title, likes) values ('author2','url2', 'title1', 70);
insert into blogs (author, url,title,likes) values ("url1", "title1", 70);