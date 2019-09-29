CREATE DATABASE IF NOT EXISTS `REModel`;

DROP TABLE IF EXISTS `REModel`.`User`;
CREATE TABLE `REModel`.`User` (
  id INTEGER AUTO_INCREMENT PRIMARY KEY,
  firstname VARCHAR(64),
  lastname VARCHAR(64),
  email VARCHAR(128),
  googleId VARCHAR(128),
  role VARCHAR(32),
  salt VARCHAR(128),
  passwordHASH VARCHAR(128),
  createdByUserId INTEGER,
  createdDateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- TODO: CONSTRAINT on createdByUserId.
  INDEX idx_REModel_firstname (firstname),
  INDEX idx_REModel_lastname (lastname),
  INDEX idx_REModel_email (email)
) ENGINE=InnoDB;
INSERT INTO `REModel`.`User` (`id`, `firstname`, `lastname`, `email`, `salt`, `passwordHASH`, `createdByUserId`)
  VALUES (1, 'Miles', 'Watson', 'miles@milescwatson.com', 'abc', '1234567890', 1);
