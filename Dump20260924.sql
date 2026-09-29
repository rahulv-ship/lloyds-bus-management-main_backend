CREATE DATABASE  IF NOT EXISTS `lloyds_bus_management` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `lloyds_bus_management`;
-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: lloyds_bus_management
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bus_pass_applications`
--

DROP TABLE IF EXISTS `bus_pass_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bus_pass_applications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `application_number` varchar(50) NOT NULL,
  `employee_id` bigint unsigned NOT NULL,
  `bus_id` bigint unsigned NOT NULL,
  `route_id` bigint unsigned NOT NULL,
  `shift_id` bigint unsigned NOT NULL,
  `pickup_stop_id` bigint unsigned NOT NULL,
  `drop_stop_id` bigint unsigned NOT NULL,
  `status` enum('DRAFT','PENDING_APPROVAL','APPROVED','REJECTED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
  `submitted_at` datetime DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `approved_by` bigint unsigned DEFAULT NULL,
  `rejected_at` datetime DEFAULT NULL,
  `rejected_by` bigint unsigned DEFAULT NULL,
  `rejection_reason` text,
  `pass_number` varchar(50) DEFAULT NULL,
  `pass_valid_from` date DEFAULT NULL,
  `pass_valid_to` date DEFAULT NULL,
  `qr_token` varchar(255) DEFAULT NULL,
  `qr_generated_at` datetime DEFAULT NULL,
  `approved_notes` text,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `application_number` (`application_number`),
  UNIQUE KEY `pass_number` (`pass_number`),
  UNIQUE KEY `qr_token` (`qr_token`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bus_pass_applications`
--

LOCK TABLES `bus_pass_applications` WRITE;
/*!40000 ALTER TABLE `bus_pass_applications` DISABLE KEYS */;
INSERT INTO `bus_pass_applications` VALUES (4,'BP-2026-569320',71005839,2,2,4,6,18,'APPROVED','2026-09-21 10:51:50','2026-09-21 10:52:52',1,NULL,NULL,NULL,'PASS-2026-1E700A15','2026-09-23','2026-09-25','e46a8314e248b9fd53ede7637e8ffa6cc3606d0af8dbbb1cd3fd8e7d70f2279a','2026-09-21 10:52:52',NULL,'2026-09-21 10:51:50','2026-09-21 10:52:52'),(5,'BP-2026-737900',71008016,2,2,4,6,18,'APPROVED','2026-09-21 12:16:56','2026-09-21 12:21:20',1,NULL,NULL,NULL,'PASS-2026-44EE0FB0','2026-09-21','2026-09-27','197e44f8ee5f4607c69538a385ddb030b996886bf3267972fe5ddde130ea6cfb','2026-09-21 12:21:20',NULL,'2026-09-21 12:16:56','2026-09-21 12:21:20'),(6,'BP-2026-725209',71005239,5,4,4,6,18,'REJECTED','2026-09-23 11:00:53',NULL,NULL,'2026-09-23 11:03:16',1,'NA',NULL,'2026-09-24','2026-09-24',NULL,NULL,NULL,'2026-09-23 11:00:53','2026-09-23 11:03:16'),(8,'BP-2026-625549',71005239,7,6,4,31,18,'REJECTED','2026-09-23 11:21:39',NULL,NULL,'2026-09-23 15:26:08',1,'NA',NULL,'2026-09-24','2026-09-24',NULL,NULL,NULL,'2026-09-23 11:21:39','2026-09-23 15:26:08'),(9,'BP-2026-802043',71007868,7,6,4,31,18,'REJECTED','2026-09-23 11:49:01',NULL,NULL,'2026-09-23 15:26:12',1,'NA',NULL,'2026-09-24','2026-09-24',NULL,NULL,NULL,'2026-09-23 11:49:01','2026-09-23 15:26:12'),(10,'BP-2026-106955',71005239,1,8,4,35,18,'APPROVED','2026-09-23 15:26:50','2026-09-23 15:27:43',1,NULL,NULL,NULL,'PASS-2026-33079EC5','2026-09-24','2026-09-24','9b0605b1285da2705376bec2ec080d6ebe093d33f7483d50aa6eb3d96a78b9b4','2026-09-23 15:27:43',NULL,'2026-09-23 15:26:50','2026-09-23 15:27:43'),(11,'BP-2026-597788',71007606,5,4,4,6,18,'PENDING_APPROVAL','2026-09-23 15:31:33',NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-24','2026-09-24',NULL,NULL,NULL,'2026-09-23 15:31:33','2026-09-23 15:31:33');
/*!40000 ALTER TABLE `bus_pass_applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bus_pass_booking_dates`
--

DROP TABLE IF EXISTS `bus_pass_booking_dates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bus_pass_booking_dates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bus_pass_application_id` bigint unsigned NOT NULL,
  `booking_date` date NOT NULL,
  `status` enum('BOOKED','CANCELLED') NOT NULL DEFAULT 'BOOKED',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `bus_pass_application_id` (`bus_pass_application_id`),
  CONSTRAINT `bus_pass_booking_dates_ibfk_1` FOREIGN KEY (`bus_pass_application_id`) REFERENCES `bus_pass_applications` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bus_pass_booking_dates`
--

LOCK TABLES `bus_pass_booking_dates` WRITE;
/*!40000 ALTER TABLE `bus_pass_booking_dates` DISABLE KEYS */;
INSERT INTO `bus_pass_booking_dates` VALUES (6,4,'2026-09-23','BOOKED','2026-09-21 10:51:50','2026-09-21 10:51:50'),(7,4,'2026-09-25','BOOKED','2026-09-21 10:51:50','2026-09-21 10:51:50'),(8,5,'2026-09-21','BOOKED','2026-09-21 12:16:56','2026-09-21 12:16:56'),(9,5,'2026-09-22','BOOKED','2026-09-21 12:16:56','2026-09-21 12:16:56'),(10,5,'2026-09-23','BOOKED','2026-09-21 12:16:56','2026-09-21 12:16:56'),(11,5,'2026-09-24','BOOKED','2026-09-21 12:16:56','2026-09-21 12:16:56'),(12,5,'2026-09-25','BOOKED','2026-09-21 12:16:56','2026-09-21 12:16:56'),(13,5,'2026-09-26','BOOKED','2026-09-21 12:16:56','2026-09-21 12:16:56'),(14,5,'2026-09-27','BOOKED','2026-09-21 12:16:56','2026-09-21 12:16:56'),(15,6,'2026-09-24','BOOKED','2026-09-23 11:00:53','2026-09-23 11:00:53'),(17,8,'2026-09-24','BOOKED','2026-09-23 11:21:39','2026-09-23 11:21:39'),(18,9,'2026-09-24','BOOKED','2026-09-23 11:49:01','2026-09-23 11:49:01'),(19,10,'2026-09-24','BOOKED','2026-09-23 15:26:50','2026-09-23 15:26:50'),(20,11,'2026-09-24','BOOKED','2026-09-23 15:31:33','2026-09-23 15:31:33');
/*!40000 ALTER TABLE `bus_pass_booking_dates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bus_route_stops`
--

DROP TABLE IF EXISTS `bus_route_stops`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bus_route_stops` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `bus_route_id` bigint unsigned NOT NULL,
  `stop_id` bigint unsigned NOT NULL,
  `stop_sequence` int unsigned NOT NULL,
  `arrival_time` time DEFAULT NULL,
  `departure_time` time DEFAULT NULL,
  `pickup_allowed` tinyint(1) DEFAULT '1',
  `drop_allowed` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=218 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bus_route_stops`
--

LOCK TABLES `bus_route_stops` WRITE;
/*!40000 ALTER TABLE `bus_route_stops` DISABLE KEYS */;
INSERT INTO `bus_route_stops` VALUES (1,1,3,1,'08:05:00','08:05:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(2,1,4,2,'08:09:00','08:09:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(3,1,5,3,'08:15:00','08:15:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(4,1,6,4,'08:20:00','08:20:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(5,1,7,5,'08:22:00','08:22:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(6,1,8,6,'08:25:00','08:25:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(7,1,9,7,'08:28:00','08:28:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(8,1,10,8,'08:33:00','08:33:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(9,1,11,9,'08:35:00','08:35:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(10,1,12,10,'08:38:00','08:38:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(11,1,13,11,'08:42:00','08:42:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(12,1,14,12,'08:45:00','08:45:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(13,1,15,13,'08:49:00','08:49:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(14,1,16,14,'08:52:00','08:52:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(15,1,17,15,'08:55:00','08:55:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(16,1,18,16,'08:58:00','08:58:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(17,2,19,1,'08:12:00','08:12:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(18,2,5,2,'08:15:00','08:15:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(19,2,6,3,'08:20:00','08:20:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(20,2,7,4,'08:22:00','08:22:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(21,2,8,5,'08:25:00','08:25:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(22,2,9,6,'08:28:00','08:28:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(23,2,10,7,'08:33:00','08:33:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(24,2,11,8,'08:35:00','08:35:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(25,2,12,9,'08:38:00','08:38:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(26,2,13,10,'08:42:00','08:42:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(27,2,14,11,'08:45:00','08:45:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(28,2,15,12,'08:49:00','08:49:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(29,2,16,13,'08:52:00','08:52:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(30,2,17,14,'08:55:00','08:55:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(31,2,18,15,'08:58:00','08:58:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(32,3,19,1,'08:12:00','08:12:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(33,3,5,2,'08:15:00','08:15:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(34,3,6,3,'08:20:00','08:20:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(35,3,7,4,'08:22:00','08:22:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(36,3,8,5,'08:25:00','08:25:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(37,3,9,6,'08:28:00','08:28:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(38,3,10,7,'08:33:00','08:33:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(39,3,11,8,'08:35:00','08:35:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(40,3,12,9,'08:38:00','08:38:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(41,3,13,10,'08:42:00','08:42:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(42,3,14,11,'08:45:00','08:45:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(43,3,15,12,'08:49:00','08:49:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(44,3,16,13,'08:52:00','08:52:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(45,3,17,14,'08:55:00','08:55:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(46,3,18,15,'08:58:00','08:58:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(47,4,20,1,'08:05:00','08:05:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(48,4,21,2,'08:07:00','08:07:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(49,4,22,3,'08:10:00','08:10:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(50,4,23,4,'08:12:00','08:12:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(51,4,24,5,'08:14:00','08:14:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(52,4,25,6,'08:16:00','08:16:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(53,4,5,7,'08:20:00','08:20:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(54,4,6,8,'08:23:00','08:23:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(55,4,7,9,'08:25:00','08:25:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(56,4,8,10,'08:28:00','08:28:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(57,4,9,11,'08:30:00','08:30:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(58,4,10,12,'08:33:00','08:33:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(59,4,11,13,'08:35:00','08:35:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(60,4,12,14,'08:38:00','08:38:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(61,4,13,15,'08:42:00','08:42:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(62,4,14,16,'08:45:00','08:45:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(63,4,15,17,'08:49:00','08:49:00',1,1,'2026-09-17 15:08:45','2026-09-17 15:08:45'),(64,4,16,18,'08:52:00','08:52:00',1,1,'2026-09-17 15:08:46','2026-09-17 15:08:46'),(65,4,17,19,'08:53:00','08:53:00',1,1,'2026-09-17 15:08:46','2026-09-17 15:08:46'),(66,4,18,20,'08:58:00','08:58:00',1,1,'2026-09-17 15:08:46','2026-09-17 15:08:46'),(67,5,26,1,'08:30:00','08:30:00',1,1,'2026-09-17 15:08:46','2026-09-17 15:08:46'),(68,5,27,2,'08:40:00','08:40:00',1,1,'2026-09-17 15:08:46','2026-09-17 15:08:46'),(69,5,28,3,'08:45:00','08:45:00',1,1,'2026-09-17 15:08:46','2026-09-17 15:08:46'),(70,5,18,4,'08:55:00','08:55:00',1,1,'2026-09-17 15:08:46','2026-09-17 15:08:46'),(71,6,26,1,'08:30:00','08:30:00',1,1,'2026-09-17 15:08:46','2026-09-17 15:08:46'),(72,6,27,2,'08:40:00','08:40:00',1,1,'2026-09-17 15:08:46','2026-09-17 15:08:46'),(73,6,28,3,'08:45:00','08:45:00',1,1,'2026-09-17 15:08:46','2026-09-17 15:08:46'),(74,6,18,4,'08:55:00','08:55:00',1,1,'2026-09-17 15:08:46','2026-09-17 15:08:46'),(75,6,30,1,'08:20:00','08:20:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(76,6,31,2,'08:35:00','08:35:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(77,6,32,3,'08:40:00','08:40:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(78,7,33,1,'08:00:00','08:00:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(79,7,34,2,'08:05:00','08:05:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(80,7,35,3,'08:07:00','08:07:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(81,7,36,4,'08:10:00','08:10:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(82,7,37,5,'08:13:00','08:13:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(83,7,38,6,'08:18:00','08:18:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(84,7,39,7,'08:30:00','08:30:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(85,7,40,8,'08:35:00','08:35:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(86,7,41,9,'08:40:00','08:40:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(87,7,42,10,'08:45:00','08:45:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(88,7,18,11,'08:55:00','08:55:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(89,8,43,1,'08:10:00','08:10:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(90,8,44,2,'08:15:00','08:15:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(91,8,45,3,'08:20:00','08:20:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(92,8,46,4,'08:25:00','08:25:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(93,8,47,5,'08:30:00','08:30:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(94,8,14,6,'08:35:00','08:35:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(95,8,15,7,'08:38:00','08:38:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(96,8,16,8,'08:45:00','08:45:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(97,8,17,9,'08:50:00','08:50:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(98,8,18,10,'08:55:00','08:55:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(99,9,3,1,'04:55:00','04:55:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(100,9,48,2,'04:57:00','04:57:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(101,9,49,3,'05:00:00','05:00:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(102,9,19,4,'05:03:00','05:03:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(103,9,5,5,'05:10:00','05:10:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(104,9,6,6,'05:13:00','05:13:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(105,9,7,7,'05:16:00','05:16:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(106,9,8,8,'05:20:00','05:20:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(107,9,9,9,'05:25:00','05:25:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(108,9,10,10,'05:28:00','05:28:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(109,9,11,11,'05:35:00','05:35:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(110,9,12,12,'05:38:00','05:38:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(111,9,13,13,'05:40:00','05:40:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(112,9,14,14,'05:44:00','05:44:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(113,9,15,15,'05:47:00','05:47:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(114,9,16,16,'05:00:00','05:00:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(115,9,17,17,'05:52:00','05:52:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(116,9,18,18,'05:55:00','05:55:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(117,10,3,1,'04:55:00','04:55:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(118,10,48,2,'04:57:00','04:57:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(119,10,49,3,'05:00:00','05:00:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(120,10,19,4,'05:03:00','05:03:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(121,10,5,5,'05:10:00','05:10:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(122,10,6,6,'05:13:00','05:13:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(123,10,7,7,'05:16:00','05:16:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(124,10,8,8,'05:20:00','05:20:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(125,10,9,9,'05:25:00','05:25:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(126,10,10,10,'05:28:00','05:28:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(127,10,11,11,'05:35:00','05:35:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(128,10,12,12,'05:38:00','05:38:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(129,10,13,13,'05:40:00','05:40:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(130,10,14,14,'05:44:00','05:44:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(131,10,15,15,'05:47:00','05:47:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(132,10,16,16,'05:00:00','05:00:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(133,10,17,17,'05:52:00','05:52:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(134,10,18,18,'05:55:00','05:55:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(135,11,3,1,'12:50:00','12:50:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(136,11,48,2,'12:52:00','12:52:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(137,11,49,3,'12:58:00','12:58:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(138,11,19,4,'13:00:00','13:00:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(139,11,5,5,'13:05:00','13:05:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(140,11,6,6,'13:08:00','13:08:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(141,11,7,7,'13:12:00','13:12:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(142,11,8,8,'13:15:00','13:15:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(143,11,9,9,'13:20:00','13:20:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(144,11,10,10,'13:25:00','13:25:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(145,11,11,11,'13:28:00','13:28:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(146,11,12,12,'13:32:00','13:32:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(147,11,13,13,'13:35:00','13:35:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(148,11,14,14,'13:37:00','13:37:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(149,11,15,15,'13:40:00','13:40:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(150,11,16,16,'13:45:00','13:45:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(151,11,17,17,'13:50:00','13:50:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(152,11,18,18,'13:55:00','13:55:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(153,12,3,1,'12:50:00','12:50:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(154,12,48,2,'12:52:00','12:52:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(155,12,49,3,'12:58:00','12:58:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(156,12,19,4,'13:00:00','13:00:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(157,12,5,5,'13:05:00','13:05:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(158,12,6,6,'13:08:00','13:08:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(159,12,7,7,'13:12:00','13:12:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(160,12,8,8,'13:15:00','13:15:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(161,12,9,9,'13:20:00','13:20:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(162,12,10,10,'13:25:00','13:25:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(163,12,11,11,'13:28:00','13:28:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(164,12,12,12,'13:32:00','13:32:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(165,12,13,13,'13:35:00','13:35:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(166,12,14,14,'13:37:00','13:37:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(167,12,15,15,'13:40:00','13:40:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(168,12,16,16,'13:45:00','13:45:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(169,12,17,17,'13:50:00','13:50:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(170,12,18,18,'13:55:00','13:55:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(171,13,3,1,'20:50:00','20:50:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(172,13,48,2,'20:52:00','20:52:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(173,13,49,3,'20:57:00','20:57:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(174,13,19,4,'21:00:00','21:00:00',1,1,'2026-09-17 15:09:13','2026-09-17 15:09:13'),(175,13,5,5,'21:05:00','21:05:00',1,1,'2026-09-17 15:09:14','2026-09-17 15:09:14'),(176,13,6,6,'21:08:00','21:08:00',1,1,'2026-09-17 15:09:14','2026-09-17 15:09:14'),(177,13,7,7,'21:12:00','21:12:00',1,1,'2026-09-17 15:09:14','2026-09-17 15:09:14'),(178,13,8,8,'21:15:00','21:15:00',1,1,'2026-09-17 15:09:14','2026-09-17 15:09:14'),(179,13,9,9,'21:20:00','21:20:00',1,1,'2026-09-17 15:09:14','2026-09-17 15:09:14'),(180,13,10,10,'21:24:00','21:24:00',1,1,'2026-09-17 15:09:14','2026-09-17 15:09:14'),(181,13,11,11,'21:28:00','21:28:00',1,1,'2026-09-17 15:09:14','2026-09-17 15:09:14'),(182,13,12,12,'21:32:00','21:32:00',1,1,'2026-09-17 15:09:14','2026-09-17 15:09:14'),(183,13,13,13,'21:35:00','21:35:00',1,1,'2026-09-17 15:09:14','2026-09-17 15:09:14'),(184,13,14,14,'21:37:00','21:37:00',1,1,'2026-09-17 15:09:14','2026-09-17 15:09:14'),(185,13,15,15,'21:40:00','21:40:00',1,1,'2026-09-17 15:09:14','2026-09-17 15:09:14'),(186,13,16,16,'21:45:00','21:45:00',1,1,'2026-09-17 15:09:14','2026-09-17 15:09:14'),(187,13,17,17,'21:50:00','21:50:00',1,1,'2026-09-17 15:09:14','2026-09-17 15:09:14'),(188,13,18,18,'21:55:00','21:55:00',1,1,'2026-09-17 15:09:14','2026-09-17 15:09:14'),(189,14,3,1,'20:50:00','20:50:00',1,1,'2026-09-17 15:09:14','2026-09-17 15:09:14'),(190,14,48,2,'20:52:00','20:52:00',1,1,'2026-09-17 15:09:14','2026-09-17 15:09:14'),(191,14,49,3,'20:57:00','20:57:00',1,1,'2026-09-17 15:09:14','2026-09-17 15:09:14'),(192,14,19,4,'21:00:00','21:00:00',1,1,'2026-09-17 15:09:14','2026-09-17 15:09:14'),(193,14,5,5,'21:05:00','21:05:00',1,1,'2026-09-17 15:09:14','2026-09-17 15:09:14'),(194,14,6,6,'21:08:00','21:08:00',1,1,'2026-09-17 15:09:14','2026-09-17 15:09:14'),(195,14,7,7,'21:12:00','21:12:00',1,1,'2026-09-17 15:09:14','2026-09-17 15:09:14'),(196,14,8,8,'21:15:00','21:15:00',1,1,'2026-09-17 15:09:14','2026-09-17 15:09:14'),(197,14,9,9,'21:20:00','21:20:00',1,1,'2026-09-17 15:09:14','2026-09-17 15:09:14'),(198,14,10,10,'21:24:00','21:24:00',1,1,'2026-09-17 15:09:14','2026-09-17 15:09:14'),(199,14,11,11,'21:28:00','21:28:00',1,1,'2026-09-17 15:09:14','2026-09-17 15:09:14'),(200,14,12,12,'21:32:00','21:32:00',1,1,'2026-09-17 15:09:14','2026-09-17 15:09:14'),(201,14,13,13,'21:35:00','21:35:00',1,1,'2026-09-17 15:09:14','2026-09-17 15:09:14'),(202,14,14,14,'21:37:00','21:37:00',1,1,'2026-09-17 15:09:14','2026-09-17 15:09:14'),(203,14,15,15,'21:40:00','21:40:00',1,1,'2026-09-17 15:09:14','2026-09-17 15:09:14'),(204,14,16,16,'21:45:00','21:45:00',1,1,'2026-09-17 15:09:14','2026-09-17 15:09:14'),(205,14,17,17,'21:50:00','21:50:00',1,1,'2026-09-17 15:09:14','2026-09-17 15:09:14'),(206,14,18,18,'21:55:00','21:55:00',1,1,'2026-09-17 15:09:14','2026-09-17 15:09:14'),(207,15,50,1,'08:10:00','08:10:00',1,1,'2026-09-17 15:31:34','2026-09-17 15:31:34'),(208,15,9,2,'08:25:00','08:25:00',1,1,'2026-09-17 15:31:34','2026-09-17 15:31:34'),(209,15,10,3,'08:28:00','08:28:00',1,1,'2026-09-17 15:31:34','2026-09-17 15:31:34'),(210,15,11,4,'08:30:00','08:30:00',1,1,'2026-09-17 15:31:34','2026-09-17 15:31:34'),(211,15,12,5,'08:32:00','08:32:00',1,1,'2026-09-17 15:31:34','2026-09-17 15:31:34'),(212,15,13,6,'08:35:00','08:35:00',1,1,'2026-09-17 15:31:34','2026-09-17 15:31:34'),(213,15,14,7,'08:40:00','08:40:00',1,1,'2026-09-17 15:31:34','2026-09-17 15:31:34'),(214,15,15,8,'08:42:00','08:42:00',1,1,'2026-09-17 15:31:34','2026-09-17 15:31:34'),(215,15,16,9,'08:45:00','08:45:00',1,1,'2026-09-17 15:31:34','2026-09-17 15:31:34'),(216,15,17,10,'08:50:00','08:50:00',1,1,'2026-09-17 15:31:34','2026-09-17 15:31:34'),(217,15,18,11,'08:55:00','08:55:00',1,1,'2026-09-17 15:31:34','2026-09-17 15:31:34');
/*!40000 ALTER TABLE `bus_route_stops` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bus_routes`
--

DROP TABLE IF EXISTS `bus_routes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bus_routes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `bus_id` bigint unsigned NOT NULL,
  `route_id` bigint unsigned NOT NULL,
  `shift_id` bigint unsigned NOT NULL,
  `employee_capacity` int unsigned DEFAULT NULL,
  `contracted_km` decimal(10,2) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `bus_id` (`bus_id`),
  KEY `route_id` (`route_id`),
  KEY `shift_id` (`shift_id`),
  CONSTRAINT `bus_routes_ibfk_1` FOREIGN KEY (`bus_id`) REFERENCES `buses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `bus_routes_ibfk_2` FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `bus_routes_ibfk_3` FOREIGN KEY (`shift_id`) REFERENCES `shifts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bus_routes`
--

LOCK TABLES `bus_routes` WRITE;
/*!40000 ALTER TABLE `bus_routes` DISABLE KEYS */;
INSERT INTO `bus_routes` VALUES (1,2,2,4,NULL,NULL,'ACTIVE','2026-09-17 15:08:45','2026-09-17 15:19:51'),(2,3,3,4,NULL,NULL,'ACTIVE','2026-09-17 15:08:45','2026-09-17 15:19:51'),(3,4,3,4,NULL,NULL,'ACTIVE','2026-09-17 15:08:45','2026-09-17 15:19:51'),(4,5,4,4,NULL,NULL,'ACTIVE','2026-09-17 15:08:45','2026-09-17 15:19:51'),(5,6,5,4,NULL,NULL,'ACTIVE','2026-09-17 15:08:46','2026-09-17 15:19:51'),(6,7,6,4,NULL,NULL,'ACTIVE','2026-09-17 15:08:46','2026-09-17 15:19:51'),(7,1,8,4,NULL,NULL,'ACTIVE','2026-09-17 15:09:13','2026-09-17 15:19:51'),(8,1,9,4,NULL,NULL,'ACTIVE','2026-09-17 15:09:13','2026-09-17 15:19:51'),(9,2,10,1,NULL,NULL,'ACTIVE','2026-09-17 15:09:13','2026-09-17 15:09:13'),(10,1,10,1,NULL,NULL,'ACTIVE','2026-09-17 15:09:13','2026-09-17 15:09:13'),(11,2,11,2,NULL,NULL,'ACTIVE','2026-09-17 15:09:13','2026-09-17 15:09:13'),(12,1,11,2,NULL,NULL,'ACTIVE','2026-09-17 15:09:13','2026-09-17 15:09:13'),(13,2,12,3,NULL,NULL,'ACTIVE','2026-09-17 15:09:13','2026-09-17 15:09:13'),(14,1,12,3,NULL,NULL,'ACTIVE','2026-09-17 15:09:14','2026-09-17 15:09:14'),(15,8,7,4,NULL,NULL,'ACTIVE','2026-09-17 15:31:34','2026-09-17 15:31:34');
/*!40000 ALTER TABLE `bus_routes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `buses`
--

DROP TABLE IF EXISTS `buses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `buses` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `bus_number` varchar(50) NOT NULL,
  `bus_type` varchar(50) DEFAULT NULL,
  `seating_capacity` int unsigned DEFAULT NULL,
  `vendor_id` bigint unsigned DEFAULT NULL,
  `driver_id` bigint unsigned DEFAULT NULL,
  `conductor_id` bigint unsigned DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `registration_number` varchar(50) DEFAULT NULL,
  `gps_device_id` varchar(100) DEFAULT NULL,
  `gps_api_details` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `bus_number` (`bus_number`),
  UNIQUE KEY `registration_number` (`registration_number`),
  KEY `vendor_id` (`vendor_id`),
  KEY `driver_id` (`driver_id`),
  KEY `conductor_id` (`conductor_id`),
  CONSTRAINT `buses_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `buses_ibfk_2` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `buses_ibfk_3` FOREIGN KEY (`conductor_id`) REFERENCES `conductors` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `buses`
--

LOCK TABLES `buses` WRITE;
/*!40000 ALTER TABLE `buses` DISABLE KEYS */;
INSERT INTO `buses` VALUES (1,'BUS-07',NULL,50,1,NULL,NULL,'ACTIVE','2026-09-17 12:08:12','2026-09-17 12:08:12',NULL,NULL,NULL),(2,'BUS-01','Route service',NULL,NULL,NULL,NULL,'ACTIVE','2026-09-17 15:08:45','2026-09-17 15:08:45',NULL,NULL,NULL),(3,'BUS-02','Route service',NULL,NULL,NULL,NULL,'ACTIVE','2026-09-17 15:08:45','2026-09-17 15:08:45',NULL,NULL,NULL),(4,'BUS-03','Route service',NULL,NULL,NULL,NULL,'ACTIVE','2026-09-17 15:08:45','2026-09-17 15:08:45',NULL,NULL,NULL),(5,'BUS-04','Route service',NULL,NULL,NULL,NULL,'ACTIVE','2026-09-17 15:08:45','2026-09-17 15:08:45',NULL,NULL,NULL),(6,'BUS-05','Route service',NULL,NULL,NULL,NULL,'ACTIVE','2026-09-17 15:08:46','2026-09-17 15:08:46',NULL,NULL,NULL),(7,'BUS-06','Route service',NULL,NULL,NULL,NULL,'ACTIVE','2026-09-17 15:08:46','2026-09-17 15:08:46',NULL,NULL,NULL),(8,'ROUTE-06-SERVICE','Route service',NULL,NULL,NULL,NULL,'ACTIVE','2026-09-17 15:31:34','2026-09-17 15:31:34',NULL,NULL,NULL);
/*!40000 ALTER TABLE `buses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conductors`
--

DROP TABLE IF EXISTS `conductors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conductors` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `conductor_code` varchar(50) NOT NULL,
  `conductor_name` varchar(150) NOT NULL,
  `mobile` varchar(20) NOT NULL,
  `vendor_id` bigint unsigned DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `conductor_code` (`conductor_code`),
  KEY `vendor_id` (`vendor_id`),
  CONSTRAINT `conductors_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conductors`
--

LOCK TABLES `conductors` WRITE;
/*!40000 ALTER TABLE `conductors` DISABLE KEYS */;
/*!40000 ALTER TABLE `conductors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `drivers`
--

DROP TABLE IF EXISTS `drivers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `drivers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `driver_code` varchar(50) NOT NULL,
  `driver_name` varchar(150) NOT NULL,
  `mobile` varchar(20) NOT NULL,
  `license_number` varchar(100) DEFAULT NULL,
  `license_expiry` date DEFAULT NULL,
  `vendor_id` bigint unsigned DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `driver_code` (`driver_code`),
  KEY `vendor_id` (`vendor_id`),
  CONSTRAINT `drivers_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `drivers`
--

LOCK TABLES `drivers` WRITE;
/*!40000 ALTER TABLE `drivers` DISABLE KEYS */;
/*!40000 ALTER TABLE `drivers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `employee_code` varchar(50) NOT NULL,
  `employee_name` varchar(150) NOT NULL,
  `department` varchar(150) DEFAULT NULL,
  `designation` varchar(150) DEFAULT NULL,
  `date_of_joining` date DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `photograph` varchar(500) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_code` (`employee_code`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES (1,'71005239','AdityaPratap Singh Baghel','Information Technology','Junior Engineer',NULL,'agl@lloyds.in','7470862028',NULL,'ACTIVE','2026-09-18 11:30:51','2026-09-23 11:50:13'),(2,'71005839','Shritesh Vinayak Bucche','Information Technology','Intern / Trainee',NULL,'shrb@lloyds.in','8421015436',NULL,'ACTIVE','2026-09-19 23:54:16','2026-09-19 23:54:16'),(3,'71008016','Rahul Ramashanker Verma','Information Technology','Executive - Engineer / Officer',NULL,'rlva@lloyds.in','8087005752',NULL,'ACTIVE','2026-09-21 12:10:52','2026-09-21 12:10:52'),(4,'71007868','Rohan Santosh Vichare','Information Technology','Manager-Data Warehouse',NULL,'rnv@lloyds.in','7506480277',NULL,'ACTIVE','2026-09-23 11:49:01','2026-09-23 11:49:01'),(5,'71007606','Amit Prakash','Administration','Assistant General Manager',NULL,'atph@lloyds.in','7328849767',NULL,'ACTIVE','2026-09-23 15:31:33','2026-09-23 15:31:33');
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `route_stops`
--

DROP TABLE IF EXISTS `route_stops`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `route_stops` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `route_id` bigint unsigned NOT NULL,
  `stop_id` bigint unsigned NOT NULL,
  `stop_sequence` int unsigned NOT NULL,
  `pickup_allowed` tinyint(1) DEFAULT '1',
  `drop_allowed` tinyint(1) DEFAULT '1',
  `expected_arrival_time` time DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `route_id` (`route_id`),
  KEY `stop_id` (`stop_id`),
  CONSTRAINT `route_stops_ibfk_1` FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `route_stops_ibfk_2` FOREIGN KEY (`stop_id`) REFERENCES `stops` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `route_stops`
--

LOCK TABLES `route_stops` WRITE;
/*!40000 ALTER TABLE `route_stops` DISABLE KEYS */;
/*!40000 ALTER TABLE `route_stops` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `routes`
--

DROP TABLE IF EXISTS `routes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `routes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `route_number` varchar(50) NOT NULL,
  `route_name` varchar(150) NOT NULL,
  `source` varchar(150) DEFAULT NULL,
  `destination` varchar(150) DEFAULT NULL,
  `contracted_km` decimal(10,2) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `route_number` (`route_number`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `routes`
--

LOCK TABLES `routes` WRITE;
/*!40000 ALTER TABLE `routes` DISABLE KEYS */;
INSERT INTO `routes` VALUES (2,'1','Chandrapur','Chandrapur','Plant',NULL,'ACTIVE','2026-09-17 15:08:45','2026-09-17 15:08:45'),(3,'2','Chandrapur','Chandrapur','Plant',NULL,'ACTIVE','2026-09-17 15:08:45','2026-09-17 15:08:45'),(4,'3','Chandrapur','Chandrapur','Plant',NULL,'ACTIVE','2026-09-17 15:08:45','2026-09-17 15:08:45'),(5,'4','Usagaon','Chandrapur','Plant',NULL,'ACTIVE','2026-09-17 15:08:46','2026-09-17 15:08:46'),(6,'5','Colony / Sakharwahi Fata','Chandrapur','Plant',NULL,'ACTIVE','2026-09-17 15:08:46','2026-09-17 15:08:46'),(7,'6','Chandrapur','Chandrapur','Plant',NULL,'ACTIVE','2026-09-17 15:09:13','2026-09-17 15:09:13'),(8,'7','Wani','Chandrapur','Plant',NULL,'ACTIVE','2026-09-17 15:09:13','2026-09-17 15:09:13'),(9,'8','Chandrapur','Chandrapur','Plant',NULL,'ACTIVE','2026-09-17 15:09:13','2026-09-17 15:09:13'),(10,'SHIFT-A','Shift A Chandrapur To Plant','Chandrapur','Plant',NULL,'ACTIVE','2026-09-17 15:09:13','2026-09-17 15:09:13'),(11,'SHIFT-B','B Shift Chandrapur To Plant','Chandrapur','Plant',NULL,'ACTIVE','2026-09-17 15:09:13','2026-09-17 15:09:13'),(12,'SHIFT-C','C Shift Chandrapur To Plant','Chandrapur','Plant',NULL,'ACTIVE','2026-09-17 15:09:13','2026-09-17 15:09:13');
/*!40000 ALTER TABLE `routes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shifts`
--

DROP TABLE IF EXISTS `shifts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shifts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `shift_code` varchar(20) NOT NULL,
  `shift_name` varchar(100) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `shift_code` (`shift_code`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shifts`
--

LOCK TABLES `shifts` WRITE;
/*!40000 ALTER TABLE `shifts` DISABLE KEYS */;
INSERT INTO `shifts` VALUES (1,'A','Shift A','08:00:00','20:00:00','ACTIVE','2026-09-17 12:09:34','2026-09-17 12:09:34'),(2,'B','B Shift','12:50:00','13:55:00','ACTIVE','2026-09-17 15:08:45','2026-09-17 15:08:45'),(3,'C','C Shift','20:50:00','21:55:00','ACTIVE','2026-09-17 15:08:45','2026-09-17 15:08:45'),(4,'G','General Shift','09:00:00','18:00:00','ACTIVE','2026-09-17 15:18:23','2026-09-17 15:18:23');
/*!40000 ALTER TABLE `shifts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stops`
--

DROP TABLE IF EXISTS `stops`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stops` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `stop_code` varchar(50) NOT NULL,
  `stop_name` varchar(150) NOT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `stop_code` (`stop_code`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stops`
--

LOCK TABLES `stops` WRITE;
/*!40000 ALTER TABLE `stops` DISABLE KEYS */;
INSERT INTO `stops` VALUES (1,'ST001','Badlapur Station',NULL,NULL,'ACTIVE','2026-09-17 12:08:58','2026-09-17 12:08:58'),(2,'ST002','Lloyds Main Gate',NULL,NULL,'ACTIVE','2026-09-17 12:09:13','2026-09-17 12:09:13'),(3,'STOP-bangali-camp','Bangali Camp',NULL,NULL,'ACTIVE','2026-09-17 15:08:45','2026-09-17 15:08:45'),(4,'STOP-ramnager-police-sation','Ramnager Police Sation',NULL,NULL,'ACTIVE','2026-09-17 15:08:45','2026-09-17 15:08:45'),(5,'STOP-janata-college','Janata College',NULL,NULL,'ACTIVE','2026-09-17 15:08:45','2026-09-17 15:08:45'),(6,'STOP-n-d-hotel','N D Hotel',NULL,NULL,'ACTIVE','2026-09-17 15:08:45','2026-09-17 15:08:45'),(7,'STOP-wadgaon-police-chouki','Wadgaon Police Chouki',NULL,NULL,'ACTIVE','2026-09-17 15:08:45','2026-09-17 15:08:45'),(8,'STOP-tristar-hotel-kundan-plaja','Tristar Hotel / Kundan Plaja',NULL,NULL,'ACTIVE','2026-09-17 15:08:45','2026-09-17 15:08:45'),(9,'STOP-kosara-mba-college','Kosara/ MBA College',NULL,NULL,'ACTIVE','2026-09-17 15:08:45','2026-09-17 15:08:45'),(10,'STOP-sainik-petrol-pump','Sainik Petrol Pump',NULL,NULL,'ACTIVE','2026-09-17 15:08:45','2026-09-17 15:08:45'),(11,'STOP-padoli','Padoli',NULL,NULL,'ACTIVE','2026-09-17 15:08:45','2026-09-17 15:08:45'),(12,'STOP-volvo-showroom','Volvo showroom',NULL,NULL,'ACTIVE','2026-09-17 15:08:45','2026-09-17 15:08:45'),(13,'STOP-khutala','Khutala',NULL,NULL,'ACTIVE','2026-09-17 15:08:45','2026-09-17 15:08:45'),(14,'STOP-midc','MIDC',NULL,NULL,'ACTIVE','2026-09-17 15:08:45','2026-09-17 15:08:45'),(15,'STOP-nagada','Nagada',NULL,NULL,'ACTIVE','2026-09-17 15:08:45','2026-09-17 15:08:45'),(16,'STOP-dhanora-fata','Dhanora Fata',NULL,NULL,'ACTIVE','2026-09-17 15:08:45','2026-09-17 15:08:45'),(17,'STOP-pandrkawada','Pandrkawada',NULL,NULL,'ACTIVE','2026-09-17 15:08:45','2026-09-17 15:08:45'),(18,'STOP-plant','Plant',NULL,NULL,'ACTIVE','2026-09-17 15:08:45','2026-09-17 15:08:45'),(19,'STOP-warora-naka','Warora Naka',NULL,NULL,'ACTIVE','2026-09-17 15:08:45','2026-09-17 15:08:45'),(20,'STOP-major-gate','Major Gate',NULL,NULL,'ACTIVE','2026-09-17 15:08:45','2026-09-17 15:08:45'),(21,'STOP-st-workshop','ST Workshop',NULL,NULL,'ACTIVE','2026-09-17 15:08:45','2026-09-17 15:08:45'),(22,'STOP-patel-garden','Patel Garden',NULL,NULL,'ACTIVE','2026-09-17 15:08:45','2026-09-17 15:08:45'),(23,'STOP-matoshri','Matoshri',NULL,NULL,'ACTIVE','2026-09-17 15:08:45','2026-09-17 15:08:45'),(24,'STOP-thande-hospital','Thande Hospital',NULL,NULL,'ACTIVE','2026-09-17 15:08:45','2026-09-17 15:08:45'),(25,'STOP-police-headcoter','Police Headcoter',NULL,NULL,'ACTIVE','2026-09-17 15:08:45','2026-09-17 15:08:45'),(26,'STOP-usagaon','Usagaon',NULL,NULL,'ACTIVE','2026-09-17 15:08:46','2026-09-17 15:08:46'),(27,'STOP-nakoda-market','Nakoda Market',NULL,NULL,'ACTIVE','2026-09-17 15:08:46','2026-09-17 15:08:46'),(28,'STOP-amrai','Amrai',NULL,NULL,'ACTIVE','2026-09-17 15:08:46','2026-09-17 15:08:46'),(30,'STOP-sakharwahi-fata','Sakharwahi Fata',NULL,NULL,'ACTIVE','2026-09-17 15:09:13','2026-09-17 15:09:13'),(31,'STOP-colony','Colony',NULL,NULL,'ACTIVE','2026-09-17 15:09:13','2026-09-17 15:09:13'),(32,'STOP-matardevi','Matardevi',NULL,NULL,'ACTIVE','2026-09-17 15:09:13','2026-09-17 15:09:13'),(33,'STOP-sai-mandir','Sai mandir',NULL,NULL,'ACTIVE','2026-09-17 15:09:13','2026-09-17 15:09:13'),(34,'STOP-tilak-chawk','Tilak Chawk',NULL,NULL,'ACTIVE','2026-09-17 15:09:13','2026-09-17 15:09:13'),(35,'STOP-lt-college','LT College',NULL,NULL,'ACTIVE','2026-09-17 15:09:13','2026-09-17 15:09:13'),(36,'STOP-bramhani-fata','Bramhani Fata',NULL,NULL,'ACTIVE','2026-09-17 15:09:13','2026-09-17 15:09:13'),(37,'STOP-lalguda','Lalguda',NULL,NULL,'ACTIVE','2026-09-17 15:09:13','2026-09-17 15:09:13'),(38,'STOP-mandar','Mandar',NULL,NULL,'ACTIVE','2026-09-17 15:09:13','2026-09-17 15:09:13'),(39,'STOP-chargaon','Chargaon',NULL,NULL,'ACTIVE','2026-09-17 15:09:13','2026-09-17 15:09:13'),(40,'STOP-purad','Purad',NULL,NULL,'ACTIVE','2026-09-17 15:09:13','2026-09-17 15:09:13'),(41,'STOP-punvat','Punvat',NULL,NULL,'ACTIVE','2026-09-17 15:09:13','2026-09-17 15:09:13'),(42,'STOP-naygao-belora-fata','Naygao / Belora Fata',NULL,NULL,'ACTIVE','2026-09-17 15:09:13','2026-09-17 15:09:13'),(43,'STOP-ramnagar-chawk','Ramnagar Chawk',NULL,NULL,'ACTIVE','2026-09-17 15:09:13','2026-09-17 15:09:13'),(44,'STOP-chanda-public-school','Chanda Public School',NULL,NULL,'ACTIVE','2026-09-17 15:09:13','2026-09-17 15:09:13'),(45,'STOP-ramsetu','Ramsetu',NULL,NULL,'ACTIVE','2026-09-17 15:09:13','2026-09-17 15:09:13'),(46,'STOP-datala-chawk','Datala Chawk',NULL,NULL,'ACTIVE','2026-09-17 15:09:13','2026-09-17 15:09:13'),(47,'STOP-villa-hotel','Villa Hotel',NULL,NULL,'ACTIVE','2026-09-17 15:09:13','2026-09-17 15:09:13'),(48,'STOP-ramnager-police-staion','Ramnager Police Staion',NULL,NULL,'ACTIVE','2026-09-17 15:09:13','2026-09-17 15:09:13'),(49,'STOP-post-office-chandrapur','Post Office Chandrapur',NULL,NULL,'ACTIVE','2026-09-17 15:09:13','2026-09-17 15:09:13'),(50,'STOP-sinarji-word','Sinarji Word',NULL,NULL,'ACTIVE','2026-09-17 15:31:34','2026-09-17 15:31:34');
/*!40000 ALTER TABLE `stops` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `employee_id` bigint unsigned DEFAULT NULL,
  `username` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('EMPLOYEE','ADMIN','HR','SECURITY','IT','TRANSPORT','VENDOR','MANAGEMENT') NOT NULL DEFAULT 'EMPLOYEE',
  `is_active` tinyint(1) DEFAULT '1',
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,NULL,'superadmin','$2b$12$2nBg..nea4GBem85YHqB9ulqzFbW3piKpZV7NBDT8zTFWv7a97Z5e','ADMIN',1,'2026-09-23 15:29:53','2026-09-16 11:30:24','2026-09-23 15:29:53');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendors`
--

DROP TABLE IF EXISTS `vendors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendors` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `vendor_code` varchar(50) NOT NULL,
  `vendor_name` varchar(150) NOT NULL,
  `contact_person` varchar(150) DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `address` text,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `vendor_code` (`vendor_code`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendors`
--

LOCK TABLES `vendors` WRITE;
/*!40000 ALTER TABLE `vendors` DISABLE KEYS */;
INSERT INTO `vendors` VALUES (1,'V001','Lloyds Transport Services','Transport Admin','9999999999',NULL,NULL,'ACTIVE','2026-09-16 15:27:50','2026-09-16 15:27:50');
/*!40000 ALTER TABLE `vendors` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-24 11:13:42
