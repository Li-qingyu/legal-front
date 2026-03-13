-- 数据库建表语句

-- 创建数据库
CREATE DATABASE IF NOT EXISTS `law_consultation` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `law_consultation`;

-- 法律类型表
CREATE TABLE IF NOT EXISTS `law_type` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` VARCHAR(50) NOT NULL COMMENT '类型名称',
  `description` VARCHAR(255) NOT NULL COMMENT '类型描述',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='法律类型表';

-- 法律案例表
CREATE TABLE IF NOT EXISTS `law_case` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `title` VARCHAR(100) NOT NULL COMMENT '案例标题',
  `type_id` INT(11) NOT NULL COMMENT '法律类型ID（逻辑外键）',
  `tags` VARCHAR(100) NOT NULL COMMENT '标签，多个标签用逗号分隔',
  `content` TEXT NOT NULL COMMENT '案例内容',
  `cover` VARCHAR(255) DEFAULT NULL COMMENT '封面图片URL',
  `publish_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '发布时间',
  `status` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '状态：1-发布，0-下架',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_type_id` (`type_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='法律案例表';

-- 用户表
CREATE TABLE IF NOT EXISTS `user` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `password` VARCHAR(100) NOT NULL COMMENT '密码（加密存储）',
  `nickname` VARCHAR(50) NOT NULL COMMENT '昵称',
  `email` VARCHAR(100) NOT NULL COMMENT '邮箱',
  `phone` VARCHAR(20) NOT NULL COMMENT '手机号',
  `role` VARCHAR(20) NOT NULL DEFAULT 'user' COMMENT '角色：admin-管理员，user-普通用户',
  `status` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_email` (`email`),
  UNIQUE KEY `uk_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 案例收藏表
CREATE TABLE IF NOT EXISTS `case_collection` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` INT(11) NOT NULL COMMENT '用户ID（逻辑外键）',
  `case_id` INT(11) NOT NULL COMMENT '案例ID（逻辑外键）',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_case` (`user_id`, `case_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='案例收藏表';

-- AI咨询记录表
CREATE TABLE IF NOT EXISTS `ai_consultation` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` INT(11) NOT NULL COMMENT '用户ID（逻辑外键）',
  `question` TEXT NOT NULL COMMENT '问题',
  `answer` TEXT NOT NULL COMMENT '回答',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '咨询时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI咨询记录表';

-- 法律条文表
CREATE TABLE IF NOT EXISTS `law_article` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `book_title` VARCHAR(200) NOT NULL COMMENT '法律书标题',
  `article_title` VARCHAR(200) NOT NULL COMMENT '法律条文标题',
  `content` TEXT NOT NULL COMMENT '条文内容',
  `publish_date` DATE NOT NULL COMMENT '发布日期',
  `effective_date` DATE NOT NULL COMMENT '生效日期',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_book_title` (`book_title`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='法律条文表';

-- 初始化数据
-- 法律类型
INSERT INTO `law_type` (`name`, `description`) VALUES
('民事法律', '涉及公民之间的权利义务关系'),
('刑事法律', '涉及犯罪和刑罚的法律'),
('行政法律', '涉及行政机关和公民之间的关系');

-- 用户
INSERT INTO `user` (`username`, `password`, `nickname`, `email`, `phone`, `role`, `status`) VALUES
('admin', '$2a$10$e6X6y1hU2uV2e8Q7e9d8e7r6t5y4u3i2o1p0o9i8u7y6t5r4e3w2q1', '管理员', 'admin@example.com', '13800138000', 'admin', 1),
('user1', '$2a$10$e6X6y1hU2uV2e8Q7e9d8e7r6t5y4u3i2o1p0o9i8u7y6t5r4e3w2q1', '用户1', 'user1@example.com', '13800138001', 'user', 1);

-- 法律案例
INSERT INTO `law_case` (`title`, `type_id`, `tags`, `content`, `cover`, `status`) VALUES
('劳动合同纠纷案例', 1, '劳动合同,纠纷', '王某与某公司因劳动合同解除产生纠纷，最终通过法律途径维护了自身权益。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=legal%20case%20labor%20contract&image_size=square', 1),
('房产继承纠纷案例', 1, '房产,继承', '李某与兄弟姐妹因房产继承问题产生争议，通过调解达成一致意见。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=legal%20case%20property%20inheritance&image_size=square', 1),
('交通事故赔偿案例', 1, '交通事故,赔偿', '张某因交通事故受伤，通过法律途径获得了合理的赔偿。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=legal%20case%20traffic%20accident&image_size=square', 1);

-- 法律条文
INSERT INTO `law_article` (`book_title`, `article_title`, `content`, `publish_date`, `effective_date`) VALUES
('中华人民共和国民法典', '第一条', '为了保护民事主体的合法权益，调整民事关系，维护社会和经济秩序，适应中国特色社会主义发展要求，弘扬社会主义核心价值观，根据宪法，制定本法。', '2020-05-28', '2021-01-01'),
('中华人民共和国劳动合同法', '第一条', '用人单位违反本法规定解除或者终止劳动合同，劳动者要求继续履行劳动合同的，用人单位应当继续履行；劳动者不要求继续履行劳动合同或者劳动合同已经不能继续履行的，用人单位应当依照本法第八十七条规定支付赔偿金。', '2012-12-28', '2013-07-01'),
('中华人民共和国劳动合同法', '第八十七条', '用人单位违反本法规定解除或者终止劳动合同的，应当依照本法第四十七条规定的经济补偿标准的二倍向劳动者支付赔偿金。', '2012-12-28', '2013-07-01'),
('中华人民共和国刑法', '第一条', '为了惩罚犯罪，保护人民，根据宪法，结合我国同犯罪作斗争的具体经验及实际情况，制定本法。', '2020-12-26', '2021-03-01');