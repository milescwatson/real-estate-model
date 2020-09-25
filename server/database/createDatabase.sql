DELIMITER ;

CREATE DATABASE IF NOT EXISTS `remodel`;

DROP TABLE IF EXISTS `remodel`.`User`;

CREATE TABLE `remodel`.`User` (
  id INTEGER AUTO_INCREMENT PRIMARY KEY,
  ip VARCHAR(16),
  createdDateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

DROP TABLE IF EXISTS `remodel`.`Models`;

CREATE TABLE `remodel`.`Models` (
  id INTEGER AUTO_INCREMENT PRIMARY KEY,
  model JSON,
  ownerID INT,
  -- JSON
  userIDs JSON,
  createdDateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

-- CREATE OR REPLACE USER 'remodel'@'localhost' identified by 'Zp3KutcpqeJ5';
-- GRANT ALL PRIVILEGES ON 'remodel'.* TO 'remodel'@localhost;
