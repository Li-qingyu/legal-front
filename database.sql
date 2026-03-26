create table ai_consultation
(
    id          int auto_increment comment '主键ID'
        primary key,
    user_id     int                                not null comment '用户ID（逻辑外键）',
    question    text                               not null comment '问题',
    answer      text                               not null comment '回答',
    create_time datetime default CURRENT_TIMESTAMP not null comment '咨询时间'
)
    comment 'AI咨询记录表' charset = utf8mb4;

create index idx_user_id
    on ai_consultation (user_id);

create table case_collection
(
    id          int auto_increment comment '主键ID'
        primary key,
    user_id     int                                not null comment '用户ID（逻辑外键）',
    case_id     int                                not null comment '案例ID（逻辑外键）',
    create_time datetime default CURRENT_TIMESTAMP not null comment '收藏时间',
    constraint uk_user_case
        unique (user_id, case_id)
)
    comment '案例收藏表' charset = utf8mb4;

create table law_article
(
    id             int auto_increment comment '主键ID'
        primary key,
    book_id        int                                null comment '法律书ID（逻辑外键）',
    article_title  varchar(200)                       not null comment '法律条文标题',
    content        text                               not null comment '条文内容',
    publish_date   date                               not null comment '发布日期',
    effective_date date                               not null comment '生效日期',
    create_time    datetime default CURRENT_TIMESTAMP not null comment '创建时间',
    update_time    datetime default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间'
)
    comment '法律条文表' charset = utf8mb4;

create index idx_book_id
    on law_article (book_id);

create table law_book
(
    id             int auto_increment comment '主键ID'
        primary key,
    name           varchar(200)                       not null comment '法律书名称',
    publish_date   date                               not null comment '发布日期',
    effective_date date                               not null comment '生效日期',
    create_time    datetime default CURRENT_TIMESTAMP not null comment '创建时间',
    update_time    datetime default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间'
)
    comment '法律书表' charset = utf8mb4;

create index idx_name
    on law_book (name);

create table law_case
(
    id           int auto_increment comment '主键ID'
        primary key,
    title        varchar(100)                         not null comment '案例标题',
    type_id      int                                  not null comment '法律类型ID（逻辑外键）',
    tags         varchar(100)                         not null comment '标签，多个标签用逗号分隔',
    content      text                                 not null comment '案例内容',
    cover        varchar(255)                         null comment '封面图片URL',
    publish_time datetime   default CURRENT_TIMESTAMP not null comment '发布时间',
    status       tinyint(1) default 1                 not null comment '状态：1-发布，0-下架',
    create_time  datetime   default CURRENT_TIMESTAMP not null comment '创建时间',
    update_time  datetime   default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间'
)
    comment '法律案例表' charset = utf8mb4;

create index idx_status
    on law_case (status);

create index idx_type_id
    on law_case (type_id);

create table law_type
(
    id          int auto_increment comment '主键ID'
        primary key,
    name        varchar(50)                        not null comment '类型名称',
    description varchar(255)                       not null comment '类型描述',
    create_time datetime default CURRENT_TIMESTAMP not null comment '创建时间',
    update_time datetime default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间',
    constraint uk_name
        unique (name)
)
    comment '法律类型表' charset = utf8mb4;

create table user
(
    id          int auto_increment comment '主键ID'
        primary key,
    username    varchar(50)                          not null comment '用户名',
    password    varchar(100)                         not null comment '密码（加密存储）',
    nickname    varchar(50)                          null comment '昵称',
    email       varchar(100)                         not null comment '邮箱',
    phone       varchar(20)                          not null comment '手机号',
    role        int        default 0                 not null comment '角色：1-管理员，0-普通用户',
    status      tinyint(1) default 1                 not null comment '状态：1-启用，0-禁用',
    create_time datetime   default CURRENT_TIMESTAMP not null comment '创建时间',
    update_time datetime   default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间',
    constraint uk_email
        unique (email),
    constraint uk_phone
        unique (phone),
    constraint uk_username
        unique (username)
)
    comment '用户表' charset = utf8mb4;

create table carousel
(
    id          bigint auto_increment comment '主键ID'
        primary key,
    title       varchar(255)                        not null comment '轮播图标题',
    subtitle    varchar(500)                        not null comment '轮播图副标题',
    button_text varchar(100)                        not null comment '按钮文本',
    image_url   varchar(500)                        null comment '轮播图图片URL',
    order_num   int         default 0               not null comment '排序序号',
    status      tinyint(1)   default 1               not null comment '状态：1-启用，0-禁用',
    create_time datetime    default CURRENT_TIMESTAMP not null comment '创建时间',
    update_time datetime    default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间'
)
    comment '轮播图表' charset = utf8mb4;

create index idx_status
    on carousel (status);

-- 轮播图初始化数据
insert into carousel (title, subtitle, button_text, image_url, order_num, status) values
('专业法律咨询服务', 'AI驱动的智能法律助手，为您提供专业、便捷的法律咨询', '立即咨询', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=legal%20consultation%20service&image_size=landscape_16_9', 1, 1),
('法律知识普及', '了解法律知识，维护自身权益', '了解更多', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=legal%20knowledge%20popularization&image_size=landscape_16_9', 2, 1),
('在线法律咨询', '随时随地获取专业法律建议', '开始咨询', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=online%20legal%20consultation&image_size=landscape_16_9', 3, 1);

