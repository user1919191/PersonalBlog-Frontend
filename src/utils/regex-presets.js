export const regexPresets = [
  {
    key: 'mobile_cn',
    title: '中国大陆手机号',
    pattern: '^1[3-9]\\d{9}$',
    flags: '',
    description: '匹配 11 位中国大陆手机号。',
    examples: ['13812345678', '15600001111']
  },
  {
    key: 'email',
    title: '邮箱地址',
    pattern: '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$',
    flags: 'i',
    description: '适合大多数常见邮箱地址校验。',
    examples: ['hello@example.com', 'dev.team@company.cn']
  },
  {
    key: 'url',
    title: 'HTTP / HTTPS URL',
    pattern: '^https?:\\/\\/[\\w.-]+(?:\\:[0-9]+)?(?:\\/[^\\s]*)?$',
    flags: 'i',
    description: '匹配常见的 http、https 地址。',
    examples: ['https://example.com', 'http://localhost:8080/api/list']
  },
  {
    key: 'ipv4',
    title: 'IPv4 地址',
    pattern: '^(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)\\.){3}(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)$',
    flags: '',
    description: '匹配标准 IPv4 地址。',
    examples: ['192.168.1.1', '10.0.0.25']
  },
  {
    key: 'date_ymd',
    title: '日期 YYYY-MM-DD',
    pattern: '^\\d{4}-\\d{2}-\\d{2}$',
    flags: '',
    description: '匹配固定格式日期字符串。',
    examples: ['2026-04-06', '2025-12-31']
  },
  {
    key: 'datetime',
    title: '日期时间 YYYY-MM-DD HH:mm:ss',
    pattern: '^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}$',
    flags: '',
    description: '匹配固定格式日期时间。',
    examples: ['2026-04-06 15:32:10', '2025-12-31 23:59:59']
  },
  {
    key: 'id_card_cn',
    title: '身份证号',
    pattern: '^[1-9]\\d{5}(?:18|19|20)\\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\\d|3[01])\\d{3}[0-9Xx]$',
    flags: '',
    description: '匹配 18 位中国大陆身份证号。',
    examples: ['110101199003071234', '32031120001212001X']
  },
  {
    key: 'qq',
    title: 'QQ 号',
    pattern: '^[1-9][0-9]{4,11}$',
    flags: '',
    description: '匹配 5 到 12 位 QQ 号。',
    examples: ['12345', '987654321']
  },
  {
    key: 'username',
    title: '用户名',
    pattern: '^[A-Za-z0-9_]{4,16}$',
    flags: '',
    description: '匹配 4 到 16 位字母、数字、下划线。',
    examples: ['blog_admin', 'user2026']
  },
  {
    key: 'strong_password',
    title: '强密码',
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,20}$',
    flags: '',
    description: '要求大小写字母、数字、特殊字符同时存在。',
    examples: ['Abc@1234', 'Safe#Pass2026']
  },
  {
    key: 'number',
    title: '数字',
    pattern: '^\\d+$',
    flags: '',
    description: '匹配非负整数数字串。',
    examples: ['123', '20260406']
  },
  {
    key: 'decimal',
    title: '小数',
    pattern: '^[+-]?\\d+(?:\\.\\d+)?$',
    flags: '',
    description: '匹配整数或小数。',
    examples: ['3.14', '-42', '+0.99']
  },
  {
    key: 'chinese',
    title: '中文字符',
    pattern: '^[\\u4e00-\\u9fa5]+$',
    flags: '',
    description: '匹配纯中文内容。',
    examples: ['博客工具', '测试数据']
  },
  {
    key: 'html_tag',
    title: 'HTML 标签',
    pattern: '^<([A-Za-z][A-Za-z0-9-]*)(?:\\s[^<>]*)?>.*<\\/\\1>$',
    flags: 'is',
    description: '匹配成对 HTML 标签的简单场景。',
    examples: ['<div>content</div>', '<span class="tag">hi</span>']
  }
]
