create table if not exists activities
(
    id          int auto_increment comment '主键ID'
        primary key,
    user_id     int                                not null comment '操作用户ID',
    type        varchar(30)                        not null comment '活动类型(case_add/case_update/case_delete/law_add/law_update/law_delete/user_add/user_update/user_delete/type_add/type_update/type_delete/book_add/book_update/book_delete)',
    title       varchar(255)                       not null comment '活动标题',
    create_time datetime default CURRENT_TIMESTAMP null comment '操作时间'
)
    comment '活动记录表' charset = utf8mb4;

create index idx_create_time
    on activities (create_time desc)
    comment '按时间降序查询索引';

create table if not exists ai_consultation
(
    id          int auto_increment comment '主键ID'
        primary key,
    session_id  varchar(64)                        not null comment '会话ID',
    turn_number int      default 1                 null comment '会话中的轮次顺序',
    user_id     int                                not null comment '用户ID（逻辑外键）',
    question    text                               not null comment '问题',
    answer      text                               not null comment '回答',
    create_time datetime default CURRENT_TIMESTAMP not null comment '咨询时间',
    data_cards  json                               null comment '数据卡片JSON数组，存储该轮问答使用的参考数据'
)
    comment 'AI咨询记录表' charset = utf8mb4;

create index idx_session_id
    on ai_consultation (session_id);

create index idx_user_id
    on ai_consultation (user_id);

create index idx_user_session
    on ai_consultation (user_id, session_id);

create table if not exists carousel
(
    id          bigint auto_increment comment '主键ID'
        primary key,
    title       varchar(255)                         not null comment '轮播图标题',
    subtitle    varchar(500)                         not null comment '轮播图副标题',
    button_text varchar(100)                         not null comment '按钮文本',
    image_url   varchar(500)                         null comment '轮播图图片URL',
    order_num   int        default 0                 not null comment '排序序号',
    status      tinyint(1) default 1                 not null comment '状态：1-启用，0-禁用',
    create_time datetime   default CURRENT_TIMESTAMP not null comment '创建时间',
    update_time datetime   default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间'
)
    comment '轮播图表' charset = utf8mb4;

create table if not exists case_collection
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

create table if not exists law_article
(
    id             int auto_increment comment '主键ID'
        primary key,
    book_id        int                                null comment '法律书ID（逻辑外键）',
    article_title  varchar(200)                       not null comment '法律条文标题',
    content        text                               not null comment '条文内容',
    publish_date   date                               not null comment '发布日期',
    effective_date date                               not null comment '生效日期',
    create_time    datetime default CURRENT_TIMESTAMP not null comment '创建时间',
    update_time    datetime default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间',
    article_order  int                                null comment '条文顺序号',
    constraint uk_book_article
        unique (book_id, article_title)
)
    comment '法律条文表' charset = utf8mb4;

create index idx_book_id
    on law_article (book_id);

create table if not exists law_book
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

create table if not exists law_case
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
    update_time  datetime   default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间',
    judgment     text                                 null
)
    comment '法律案例表' charset = utf8mb4;

create index idx_status
    on law_case (status);

create index idx_type_id
    on law_case (type_id);

create table if not exists law_type
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

create table if not exists user
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

