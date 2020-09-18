-- TODO: revert this, it was incorrectly changed


CREATE DATABASE IF NOT EXISTS `real-estate-model`;

DROP TABLE IF EXISTS `real-estate-model`.`User`;

CREATE TABLE `real-estate-model`.`User` (
  id INTEGER AUTO_INCREMENT PRIMARY KEY,
  ip VARCHAR(16),
  createdDateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO `real-estate-model`.`User`(id, ip)
  VALUES(1, '123.123.123.123');

DROP TABLE IF EXISTS `real-estate-model`.`Models`;
CREATE TABLE `real-estate-model`.`Models` (
  id INTEGER AUTO_INCREMENT PRIMARY KEY,
  model JSON,
  ownerID INT,
  -- JSON
  userIDs JSON,
  createdDateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
