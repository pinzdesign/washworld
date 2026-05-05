-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Vært: mariadb
-- Genereringstid: 05. 05 2026 kl. 11:47:02
-- Serverversion: 10.6.20-MariaDB-ubu2004
-- PHP-version: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `washworld`
--

-- --------------------------------------------------------

--
-- Struktur-dump for tabellen `membership`
--

CREATE TABLE `membership` (
  `membership_pk` int(200) NOT NULL,
  `user_fk` int(200) NOT NULL,
  `membership_type_fk` int(200) NOT NULL,
  `primary_dep_ext_id` int(200) NOT NULL,
  `car_plate` varchar(200) NOT NULL,
  `access_all_dep` tinyint(1) NOT NULL,
  `membership_start_at` bigint(200) NOT NULL,
  `membership_end_at` bigint(200) NOT NULL,
  `membership_status` varchar(200) NOT NULL,
  `created_at` bigint(200) NOT NULL,
  `deleted_at` bigint(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Data dump for tabellen `membership`
--

INSERT INTO `membership` (`membership_pk`, `user_fk`, `membership_type_fk`, `primary_dep_ext_id`, `car_plate`, `access_all_dep`, `membership_start_at`, `membership_end_at`, `membership_status`, `created_at`, `deleted_at`) VALUES
(1, 19, 1, 123, 'AF 24333', 1, 1777979177, 1780650377, 'cancelled', 1777979177, 1777981323),
(2, 19, 1, 123, 'AF 24333', 1, 1777979177, 1780650377, 'active', 1777979177, 0);

-- --------------------------------------------------------

--
-- Struktur-dump for tabellen `membership_type`
--

CREATE TABLE `membership_type` (
  `membership_type_pk` int(200) NOT NULL,
  `membership_type_name` varchar(200) NOT NULL,
  `membership_type_price` decimal(65,0) NOT NULL,
  `membership_desc` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Data dump for tabellen `membership_type`
--

INSERT INTO `membership_type` (`membership_type_pk`, `membership_type_name`, `membership_type_price`, `membership_desc`) VALUES
(1, 'Guld', 139, 'En guld standard.'),
(2, 'Premium', 169, 'En mere grundig vask med noget ekstra.'),
(3, 'Brilliant', 199, 'Den bedste oplevelse med alle ekstras inkluderet.');

-- --------------------------------------------------------

--
-- Struktur-dump for tabellen `test`
--

CREATE TABLE `test` (
  `test_id` int(200) NOT NULL,
  `test_message` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Data dump for tabellen `test`
--

INSERT INTO `test` (`test_id`, `test_message`) VALUES
(1, 'Running!');

-- --------------------------------------------------------

--
-- Struktur-dump for tabellen `users`
--

CREATE TABLE `users` (
  `user_pk` int(10) UNSIGNED NOT NULL,
  `user_email` varchar(255) NOT NULL,
  `user_password` varchar(255) NOT NULL,
  `user_phone` int(8) NOT NULL,
  `user_first_name` varchar(100) NOT NULL,
  `user_last_name` varchar(100) NOT NULL,
  `user_status` varchar(30) NOT NULL DEFAULT 'pending',
  `user_washcoins` int(10) NOT NULL DEFAULT 0,
  `user_verification_key` char(32) DEFAULT NULL,
  `user_verified_at` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` bigint(20) UNSIGNED NOT NULL,
  `deleted_at` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Data dump for tabellen `users`
--

INSERT INTO `users` (`user_pk`, `user_email`, `user_password`, `user_phone`, `user_first_name`, `user_last_name`, `user_status`, `user_washcoins`, `user_verification_key`, `user_verified_at`, `created_at`, `deleted_at`) VALUES
(19, 'tyrael2101@hotmail.com', 'scrypt:32768:8:1$P7i7828mVTg9IM1S$d4edaee2abe02b4e1086aafe27a2fc976b8249e03e2e4b1115c683bd3200c4b345f624b3b34564c8f68e590ed6282f1803d0fade64b61508a11b37f04f7b14b4', 12345678, 'Ivan', 'Popov', 'active', 0, '98f856902ea94a0bb39f9bde5ebc0a8f', 1777715930, 1777715920, NULL);

--
-- Begrænsninger for dumpede tabeller
--

--
-- Indeks for tabel `membership`
--
ALTER TABLE `membership`
  ADD PRIMARY KEY (`membership_pk`);

--
-- Indeks for tabel `membership_type`
--
ALTER TABLE `membership_type`
  ADD PRIMARY KEY (`membership_type_pk`);

--
-- Indeks for tabel `test`
--
ALTER TABLE `test`
  ADD PRIMARY KEY (`test_id`);

--
-- Indeks for tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_pk`),
  ADD UNIQUE KEY `user_email` (`user_email`) USING BTREE;

--
-- Brug ikke AUTO_INCREMENT for slettede tabeller
--

--
-- Tilføj AUTO_INCREMENT i tabel `membership`
--
ALTER TABLE `membership`
  MODIFY `membership_pk` int(200) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Tilføj AUTO_INCREMENT i tabel `membership_type`
--
ALTER TABLE `membership_type`
  MODIFY `membership_type_pk` int(200) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Tilføj AUTO_INCREMENT i tabel `test`
--
ALTER TABLE `test`
  MODIFY `test_id` int(200) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Tilføj AUTO_INCREMENT i tabel `users`
--
ALTER TABLE `users`
  MODIFY `user_pk` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
