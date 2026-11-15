export const mysqlCommandCategories = [
  { key: 'basic', label: '基础查询' },
  { key: 'ddl', label: '表结构 DDL' },
  { key: 'dml', label: '数据操作 DML' },
  { key: 'join', label: '关联与聚合' },
  { key: 'function', label: '函数与表达式' },
  { key: 'index', label: '索引与性能' },
  { key: 'advanced', label: '事务与进阶' }
]

export const mysqlCommands = [
  {
    id: 'mysql-select',
    title: '基础查询 SELECT',
    category: 'basic',
    command: 'SELECT column1, column2 FROM table_name;',
    summary: '查询指定列或全部列，是最基础的读操作。',
    scenario: ['查数据', '接口联调'],
    example: 'SELECT id, username FROM users;',
    outputTips: ['大表线上排查尽量避免无条件 SELECT *。'],
    aliases: ['查询', 'select']
  },
  {
    id: 'mysql-where',
    title: '条件过滤 WHERE',
    category: 'basic',
    command: 'SELECT * FROM table_name WHERE condition;',
    summary: '对结果集进行条件筛选。',
    scenario: ['精准查询', '条件过滤'],
    example: 'SELECT * FROM users WHERE status = 1 AND age >= 18;',
    outputTips: ['优先让 where 命中索引字段。'],
    aliases: ['where']
  },
  {
    id: 'mysql-distinct',
    title: '去重 DISTINCT',
    category: 'basic',
    command: 'SELECT DISTINCT column_name FROM table_name;',
    summary: '对结果去重，返回唯一值集合。',
    scenario: ['查唯一值', '枚举项统计'],
    example: 'SELECT DISTINCT category_id FROM article;',
    aliases: ['distinct', '去重']
  },
  {
    id: 'mysql-in-between-like',
    title: 'IN / BETWEEN / LIKE 常用过滤',
    category: 'basic',
    command: 'SELECT * FROM table_name WHERE id IN (1,2,3) AND created_at BETWEEN "2026-01-01" AND "2026-12-31";',
    summary: '常用的集合、范围、模糊匹配写法。',
    scenario: ['范围筛选', '模糊搜索'],
    example: 'SELECT * FROM article WHERE title LIKE "%MySQL%" AND status IN (1, 2);',
    outputTips: ['前置 % 的 LIKE 往往无法走普通索引。'],
    aliases: ['in', 'between', 'like']
  },
  {
    id: 'mysql-order-limit',
    title: '排序与分页',
    category: 'basic',
    command: 'SELECT * FROM table_name ORDER BY column DESC LIMIT 0, 20;',
    summary: '对结果集排序并分页。',
    scenario: ['列表分页', '后台管理查询'],
    example: 'SELECT * FROM articles ORDER BY created_at DESC LIMIT 0, 20;',
    outputTips: ['大 offset 分页要考虑游标分页优化。'],
    aliases: ['limit', 'order by', '分页']
  },
  {
    id: 'mysql-create-database',
    title: '创建数据库',
    category: 'ddl',
    command: 'CREATE DATABASE blog DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;',
    summary: '创建数据库并指定字符集和排序规则。',
    scenario: ['初始化数据库', '新环境搭建'],
    example: 'CREATE DATABASE blog DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;',
    outputTips: ['新项目建议统一用 utf8mb4。'],
    aliases: ['create database', '建库']
  },
  {
    id: 'mysql-use-database',
    title: '切换数据库',
    category: 'ddl',
    command: 'USE blog;',
    summary: '切换当前会话正在使用的数据库。',
    scenario: ['命令行操作', '切库'],
    example: 'USE blog;',
    aliases: ['use']
  },
  {
    id: 'mysql-create-table',
    title: '建表 CREATE TABLE',
    category: 'ddl',
    command: 'CREATE TABLE users (id BIGINT PRIMARY KEY AUTO_INCREMENT, username VARCHAR(64) NOT NULL);',
    summary: '创建新表并定义列、主键、约束。',
    scenario: ['建新表', '初始化结构'],
    example: 'CREATE TABLE users (id BIGINT PRIMARY KEY AUTO_INCREMENT, username VARCHAR(64) NOT NULL, created_at DATETIME NOT NULL);',
    outputTips: ['建表时把字符集、引擎、索引一并定好。'],
    aliases: ['create table', '建表']
  },
  {
    id: 'mysql-alter-table',
    title: '修改表 ALTER TABLE',
    category: 'ddl',
    command: 'ALTER TABLE users ADD COLUMN email VARCHAR(128);',
    summary: '新增列、改列、删列、加约束都通过 ALTER TABLE。',
    scenario: ['表结构升级', '发版迁移'],
    example: 'ALTER TABLE users ADD COLUMN email VARCHAR(128) NOT NULL DEFAULT "";',
    caution: ['大表变更前先评估锁表和时长。'],
    aliases: ['alter table', '改表']
  },
  {
    id: 'mysql-rename-table',
    title: '重命名表',
    category: 'ddl',
    command: 'RENAME TABLE old_name TO new_name;',
    summary: '修改表名。',
    scenario: ['表改名', '历史表切换'],
    example: 'RENAME TABLE user_tmp TO users;',
    aliases: ['rename table']
  },
  {
    id: 'mysql-drop-truncate',
    title: '删除表与清空表',
    category: 'ddl',
    command: 'DROP TABLE users; / TRUNCATE TABLE users;',
    summary: 'DROP 删除结构和数据，TRUNCATE 快速清空数据。',
    scenario: ['清理测试表', '清空表数据'],
    example: 'TRUNCATE TABLE temp_import;',
    caution: ['两者都要谨慎，尤其生产环境。'],
    aliases: ['drop table', 'truncate']
  },
  {
    id: 'mysql-create-index',
    title: '创建索引',
    category: 'ddl',
    command: 'CREATE INDEX idx_users_email ON users(email);',
    summary: '为查询字段建立普通索引或联合索引。',
    scenario: ['慢查询优化', '筛选字段加速'],
    example: 'CREATE INDEX idx_articles_status_created_at ON articles(status, created_at);',
    outputTips: ['联合索引要遵守最左前缀原则。'],
    aliases: ['create index', '索引']
  },
  {
    id: 'mysql-drop-index',
    title: '删除索引',
    category: 'ddl',
    command: 'DROP INDEX idx_users_email ON users;',
    summary: '删除不再需要或错误设计的索引。',
    scenario: ['移除冗余索引', '索引调整'],
    example: 'DROP INDEX idx_articles_old ON articles;',
    aliases: ['drop index']
  },
  {
    id: 'mysql-insert',
    title: '插入数据 INSERT',
    category: 'dml',
    command: 'INSERT INTO users(username, email) VALUES ("alice", "a@test.com");',
    summary: '插入一条或多条记录。',
    scenario: ['新增数据', '初始化脚本'],
    example: 'INSERT INTO users(username, email) VALUES ("alice", "a@test.com"), ("bob", "b@test.com");',
    aliases: ['insert']
  },
  {
    id: 'mysql-insert-select',
    title: 'INSERT INTO ... SELECT',
    category: 'dml',
    command: 'INSERT INTO archive_users(id, username) SELECT id, username FROM users WHERE status = 0;',
    summary: '把查询结果直接插入到另一张表。',
    scenario: ['归档数据', '迁移数据'],
    example: 'INSERT INTO archive_users(id, username) SELECT id, username FROM users WHERE deleted = 1;',
    aliases: ['insert select']
  },
  {
    id: 'mysql-update',
    title: '更新数据 UPDATE',
    category: 'dml',
    command: 'UPDATE users SET status = 1 WHERE id = 1;',
    summary: '按条件更新已有数据。',
    scenario: ['状态更新', '批量修正'],
    example: 'UPDATE users SET last_login_at = NOW() WHERE id = 1;',
    caution: ['没有 WHERE 可能更新全表。'],
    aliases: ['update']
  },
  {
    id: 'mysql-update-join',
    title: '关联更新 UPDATE JOIN',
    category: 'dml',
    command: 'UPDATE users u JOIN profiles p ON u.id = p.user_id SET u.phone = p.phone WHERE u.phone IS NULL;',
    summary: '基于关联表条件更新目标表。',
    scenario: ['数据补齐', '联表修正'],
    example: 'UPDATE orders o JOIN user_level l ON o.user_id = l.user_id SET o.discount = l.discount;',
    aliases: ['update join']
  },
  {
    id: 'mysql-delete',
    title: '删除数据 DELETE',
    category: 'dml',
    command: 'DELETE FROM users WHERE id = 1;',
    summary: '按条件删除记录。',
    scenario: ['删除脏数据', '后台管理删除'],
    example: 'DELETE FROM users WHERE status = 0 AND created_at < "2025-01-01";',
    caution: ['没有 WHERE 可能删全表。'],
    aliases: ['delete']
  },
  {
    id: 'mysql-upsert',
    title: '插入或更新',
    category: 'dml',
    command: 'INSERT INTO user_counter(user_id, total) VALUES (1, 1) ON DUPLICATE KEY UPDATE total = total + 1;',
    summary: '主键或唯一键冲突时执行更新。',
    scenario: ['计数器', '幂等写入'],
    example: 'INSERT INTO user_counter(user_id, total) VALUES (1, 1) ON DUPLICATE KEY UPDATE total = total + 1;',
    aliases: ['upsert', 'on duplicate key update']
  },
  {
    id: 'mysql-replace-into',
    title: 'REPLACE INTO',
    category: 'dml',
    command: 'REPLACE INTO config(`key`, `value`) VALUES ("theme", "dark");',
    summary: '存在唯一键时先删后插，不同于普通 update。',
    scenario: ['配置覆盖', '简单替换写入'],
    example: 'REPLACE INTO config(`key`, `value`) VALUES ("site_name", "Blog");',
    caution: ['本质是 delete + insert，可能触发额外副作用。'],
    aliases: ['replace into']
  },
  {
    id: 'mysql-join',
    title: '内连接 JOIN',
    category: 'join',
    command: 'SELECT a.*, b.name FROM article a JOIN category b ON a.category_id = b.id;',
    summary: '关联两张或多张表查询。',
    scenario: ['联表查询', '查详情附带名称'],
    example: 'SELECT u.username, p.phone FROM users u LEFT JOIN profiles p ON u.id = p.user_id;',
    outputTips: ['别名能让复杂 SQL 更清晰。'],
    aliases: ['join', '联表']
  },
  {
    id: 'mysql-left-right-join',
    title: 'LEFT / RIGHT JOIN',
    category: 'join',
    command: 'SELECT u.id, p.phone FROM users u LEFT JOIN profiles p ON u.id = p.user_id;',
    summary: '保留一侧主表数据的关联写法。',
    scenario: ['保留主表', '查缺失关联'],
    example: 'SELECT u.id FROM users u LEFT JOIN profiles p ON u.id = p.user_id WHERE p.user_id IS NULL;',
    aliases: ['left join', 'right join']
  },
  {
    id: 'mysql-group-by',
    title: '分组统计 GROUP BY',
    category: 'join',
    command: 'SELECT status, COUNT(*) FROM orders GROUP BY status;',
    summary: '按字段分组后做聚合统计。',
    scenario: ['报表统计', '状态计数'],
    example: 'SELECT category_id, COUNT(*) AS total FROM article GROUP BY category_id;',
    aliases: ['group by', '统计']
  },
  {
    id: 'mysql-having',
    title: '分组后过滤 HAVING',
    category: 'join',
    command: 'SELECT status, COUNT(*) total FROM orders GROUP BY status HAVING total > 10;',
    summary: '对聚合分组后的结果继续过滤。',
    scenario: ['筛选大于阈值的分组'],
    example: 'SELECT user_id, COUNT(*) total FROM orders GROUP BY user_id HAVING total >= 5;',
    aliases: ['having']
  },
  {
    id: 'mysql-subquery',
    title: '子查询',
    category: 'join',
    command: 'SELECT * FROM users WHERE id IN (SELECT user_id FROM orders WHERE total_amount > 1000);',
    summary: '把一个查询作为另一个查询的条件或数据源。',
    scenario: ['嵌套查询', '复杂过滤'],
    example: 'SELECT * FROM article WHERE author_id IN (SELECT id FROM users WHERE status = 1);',
    aliases: ['subquery', '子查询']
  },
  {
    id: 'mysql-union',
    title: 'UNION / UNION ALL',
    category: 'join',
    command: 'SELECT name FROM user_a UNION ALL SELECT name FROM user_b;',
    summary: '合并多个结果集，UNION 去重，UNION ALL 不去重。',
    scenario: ['结果集合并', '多表结果统一'],
    example: 'SELECT id FROM new_users UNION SELECT id FROM old_users;',
    aliases: ['union']
  },
  {
    id: 'mysql-count-sum-avg',
    title: 'COUNT / SUM / AVG / MAX / MIN',
    category: 'function',
    command: 'SELECT COUNT(*), SUM(amount), AVG(amount) FROM orders;',
    summary: '最常用的聚合函数。',
    scenario: ['统计数值', '汇总报表'],
    example: 'SELECT COUNT(*) AS total, SUM(total_amount) AS money FROM orders WHERE status = 1;',
    aliases: ['count', 'sum', 'avg']
  },
  {
    id: 'mysql-ifnull-coalesce',
    title: 'IFNULL / COALESCE 空值处理',
    category: 'function',
    command: 'SELECT IFNULL(nickname, username) FROM users;',
    summary: '对 NULL 值做兜底替换。',
    scenario: ['展示兜底', '空值兼容'],
    example: 'SELECT COALESCE(phone, mobile, "-") FROM users;',
    aliases: ['ifnull', 'coalesce']
  },
  {
    id: 'mysql-case-when',
    title: 'CASE WHEN 条件表达式',
    category: 'function',
    command: 'SELECT username, CASE WHEN status = 1 THEN "正常" ELSE "禁用" END AS status_text FROM users;',
    summary: '在查询中做条件分支。',
    scenario: ['状态映射', '分类统计'],
    example: 'SELECT SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) AS enabled_total FROM users;',
    aliases: ['case when']
  },
  {
    id: 'mysql-date-functions',
    title: '日期函数 NOW / DATE_FORMAT / DATE_SUB',
    category: 'function',
    command: 'SELECT NOW(), DATE_FORMAT(NOW(), "%Y-%m-%d"), DATE_SUB(NOW(), INTERVAL 7 DAY);',
    summary: '常用时间计算和格式化函数。',
    scenario: ['时间筛选', '按天统计'],
    example: 'SELECT * FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY);',
    aliases: ['now', 'date_format', 'date_sub']
  },
  {
    id: 'mysql-string-functions',
    title: '字符串函数 CONCAT / LENGTH / SUBSTRING',
    category: 'function',
    command: 'SELECT CONCAT(first_name, " ", last_name), LENGTH(username), SUBSTRING(phone, 1, 3) FROM users;',
    summary: '处理字符串拼接、长度、截取等常用操作。',
    scenario: ['展示拼接', '字段清洗'],
    example: 'SELECT CONCAT("ID-", id) FROM users;',
    aliases: ['concat', 'substring']
  },
  {
    id: 'mysql-exists',
    title: 'EXISTS / NOT EXISTS',
    category: 'function',
    command: 'SELECT * FROM users u WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);',
    summary: '用于判断子查询是否存在结果。',
    scenario: ['存在性判断', '关联过滤'],
    example: 'SELECT * FROM users u WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = u.id);',
    aliases: ['exists']
  },
  {
    id: 'mysql-explain',
    title: '执行计划 EXPLAIN',
    category: 'index',
    command: 'EXPLAIN SELECT * FROM users WHERE email = "a@test.com";',
    summary: '查看 SQL 执行计划，是调优入口。',
    scenario: ['慢查询分析', '索引命中判断'],
    example: 'EXPLAIN SELECT * FROM article WHERE status = 1 ORDER BY created_at DESC;',
    outputTips: ['重点看 type、key、rows、filtered、Extra。'],
    aliases: ['explain', '执行计划']
  },
  {
    id: 'mysql-explain-analyze',
    title: 'EXPLAIN ANALYZE',
    category: 'index',
    command: 'EXPLAIN ANALYZE SELECT * FROM users WHERE email = "a@test.com";',
    summary: '查看实际执行路径和耗时，适合新版 MySQL 进一步分析。',
    scenario: ['精细性能分析', '执行路径验证'],
    example: 'EXPLAIN ANALYZE SELECT * FROM article WHERE status = 1 ORDER BY created_at DESC LIMIT 20;',
    caution: ['要确认数据库版本支持。'],
    aliases: ['explain analyze']
  },
  {
    id: 'mysql-show-index',
    title: '查看索引',
    category: 'index',
    command: 'SHOW INDEX FROM users;',
    summary: '查看表上已有索引及其字段顺序。',
    scenario: ['确认索引存在', '排查重复索引'],
    example: 'SHOW INDEX FROM article;',
    aliases: ['show index']
  },
  {
    id: 'mysql-show-create',
    title: '查看建表语句',
    category: 'index',
    command: 'SHOW CREATE TABLE users;',
    summary: '查看表的完整 DDL 定义。',
    scenario: ['确认真实结构', '排查字段/索引定义'],
    example: 'SHOW CREATE TABLE users;',
    aliases: ['show create table']
  },
  {
    id: 'mysql-analyze-optimize',
    title: 'ANALYZE / OPTIMIZE TABLE',
    category: 'index',
    command: 'ANALYZE TABLE users; / OPTIMIZE TABLE users;',
    summary: '更新统计信息或整理表空间。',
    scenario: ['统计信息更新', '碎片整理'],
    example: 'ANALYZE TABLE article;',
    caution: ['执行前确认业务低峰期。'],
    aliases: ['analyze table', 'optimize table']
  },
  {
    id: 'mysql-transaction',
    title: '事务控制',
    category: 'advanced',
    command: 'START TRANSACTION; ... COMMIT;',
    summary: '保证一组 SQL 的原子性。',
    scenario: ['转账', '多表一致性修改'],
    example: 'START TRANSACTION;\nUPDATE account SET balance = balance - 100 WHERE id = 1;\nUPDATE account SET balance = balance + 100 WHERE id = 2;\nCOMMIT;',
    outputTips: ['出错时执行 ROLLBACK 回滚。'],
    aliases: ['transaction', 'commit', 'rollback']
  },
  {
    id: 'mysql-savepoint',
    title: 'SAVEPOINT 保存点',
    category: 'advanced',
    command: 'SAVEPOINT sp1; ROLLBACK TO sp1;',
    summary: '在事务中设置局部回滚点。',
    scenario: ['长事务局部回滚', '复杂事务控制'],
    example: 'START TRANSACTION;\nSAVEPOINT sp1;\nUPDATE orders SET status = 2 WHERE id = 1;\nROLLBACK TO sp1;\nCOMMIT;',
    aliases: ['savepoint']
  },
  {
    id: 'mysql-lock',
    title: '查看锁等待与死锁',
    category: 'advanced',
    command: 'SHOW ENGINE INNODB STATUS;',
    summary: '查看 InnoDB 锁、事务、死锁等内部状态。',
    scenario: ['锁等待', '死锁', '事务阻塞'],
    example: 'SHOW ENGINE INNODB STATUS;',
    outputTips: ['重点关注 LATEST DETECTED DEADLOCK 和 TRANSACTIONS。'],
    aliases: ['deadlock', 'lock']
  },
  {
    id: 'mysql-processlist',
    title: '查看连接与运行 SQL',
    category: 'advanced',
    command: 'SHOW FULL PROCESSLIST;',
    summary: '查看当前连接、执行中 SQL 和线程状态。',
    scenario: ['长 SQL', '连接占满', '排查卡住查询'],
    example: 'SHOW FULL PROCESSLIST;',
    outputTips: ['Time 长、State 异常的连接优先看。'],
    aliases: ['processlist']
  },
  {
    id: 'mysql-kill',
    title: '终止连接或查询',
    category: 'advanced',
    command: 'KILL <process_id>;',
    summary: '手动终止异常连接或长 SQL。',
    scenario: ['杀掉长查询', '释放卡死连接'],
    example: 'KILL 12345;',
    caution: ['执行前确认目标连接确实异常。'],
    aliases: ['kill']
  },
  {
    id: 'mysql-show-variables',
    title: '查看变量与参数',
    category: 'advanced',
    command: 'SHOW VARIABLES LIKE "max_connections";',
    summary: '查看数据库参数配置。',
    scenario: ['环境排查', '参数确认'],
    example: 'SHOW VARIABLES LIKE "innodb_buffer_pool_size";',
    aliases: ['show variables']
  },
  {
    id: 'mysql-show-status',
    title: '查看运行状态',
    category: 'advanced',
    command: 'SHOW GLOBAL STATUS LIKE "Threads_connected";',
    summary: '查看全局状态指标。',
    scenario: ['连接数排查', '运行状态观察'],
    example: 'SHOW GLOBAL STATUS LIKE "Slow_queries";',
    aliases: ['show status']
  },
  {
    id: 'mysql-common-flow',
    title: '慢查询排查流程',
    category: 'advanced',
    command: 'EXPLAIN -> SHOW INDEX -> 改写 SQL / 补索引',
    summary: '最常见的 SQL 调优流程：先看执行计划，再看索引，最后再改写。',
    scenario: ['慢查询优化', '接口超时', '分页慢'],
    example: 'EXPLAIN SELECT * FROM article WHERE status = 1 ORDER BY created_at DESC LIMIT 20;',
    steps: ['先用 EXPLAIN 看是否走索引。', '确认 where/order by/join 字段是否有合适索引。', '避免大表全表扫描、filesort、临时表。', '必要时调整 SQL、补联合索引或改分页方案。'],
    outputTips: ['不是所有慢 SQL 都靠加索引解决，返回行数和排序方式同样关键。'],
    aliases: ['慢查询', 'sql优化']
  }
]
