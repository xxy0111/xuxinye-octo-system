/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 * 生成示例知识库文件：产品说明.docx（用 jszip 构造最小可解析的 docx）
 */
const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

const xuxinye_OUTPUT = path.join(__dirname, '..', 'sample', '产品说明.docx');

const xuxinye_PARAGRAPHS = [
  '星澜智汇 Pro 产品说明',
  '一、产品定位',
  '星澜智汇 Pro 是星澜科技面向中大型企业推出的一站式数据分析与可视化平台，定位为企业统一的数据消费入口。产品覆盖数据接入、指标建模、可视化分析、自然语言问答与权限治理全链路，帮助业务人员在无需编写代码的情况下完成日常分析。',
  '二、核心功能',
  '1. 多数据源接入：内置 MySQL、PostgreSQL、Oracle、SQL Server、ClickHouse、达梦与飞书多维表格连接器，支持定时同步与增量更新。',
  '2. 拖拽式可视化：提供 30 余种图表组件，支持钻取、联动、条件格式与大屏拼接，图表可导出为图片或 PDF。',
  '3. 指标中心：统一维护指标口径、计算逻辑与负责人，避免同一指标在不同报表中口径不一致。',
  '4. 自然语言查询：输入业务问题即可生成查询与图表，支持中文同义词与指标别名。',
  '5. 权限与审计：支持组织、角色、行列级权限，所有查询与导出操作写入审计日志，日志默认保留 180 天。',
  '三、版本与价格',
  '标准版：按账号订阅，每个账号每年 980 元，含 10GB 数据存储与标准技术支持。',
  '专业版：每个账号每年 1680 元，含 100GB 数据存储、指标中心、自然语言查询与 5×8 技术支持。',
  '企业版：按项目报价，支持私有化部署、单点登录、专属客户成功经理与 7×24 紧急响应。',
  '教育与非营利机构可申请 5 折优惠，需提供有效证明文件。',
  '四、部署与运维',
  '公有云版本开箱即用，开通后 10 分钟内可完成首个数据源接入。私有化部署最低要求为 8 核 CPU、32GB 内存、500GB SSD，推荐三节点集群。平台提供健康检查接口与 Prometheus 指标输出，便于接入企业监控体系。',
  '五、服务等级协议（SLA）',
  '专业版与企业版承诺月度可用性不低于 99.9%。发生 P1 级故障时，企业版 30 分钟内响应、4 小时内恢复；专业版 2 小时内响应、8 小时内恢复。未达标的服务时长将按合同约定进行补偿。',
  '六、常见限制',
  '单次查询默认超时时间为 60 秒，单张图表最多展示 10 万行数据；如需更高配额可在控制台提交工单申请。免费试用版不支持私有化部署与 API 导出。'
];

// 构造 docx 所需的三个基础部件
function xuxinye_buildDocx(xuxinye_lines) {
  const xuxinye_escape = function (xuxinye_text) {
    return xuxinye_text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };

  const xuxinye_body = xuxinye_lines
    .map(function (xuxinye_line) {
      return '<w:p><w:r><w:t xml:space="preserve">' + xuxinye_escape(xuxinye_line) + '</w:t></w:r></w:p>';
    })
    .join('');

  const xuxinye_document =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
    '<w:body>' +
    xuxinye_body +
    '</w:body></w:document>';

  const xuxinye_contentTypes =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
    '</Types>';

  const xuxinye_rels =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
    '</Relationships>';

  return { xuxinye_document, xuxinye_contentTypes, xuxinye_rels };
}

async function xuxinye_generateSampleDocx() {
  const xuxinye_zip = new JSZip();
  const xuxinye_parts = xuxinye_buildDocx(xuxinye_PARAGRAPHS);
  xuxinye_zip.file('[Content_Types].xml', xuxinye_parts.xuxinye_contentTypes);
  xuxinye_zip.folder('_rels').file('.rels', xuxinye_parts.xuxinye_rels);
  xuxinye_zip.folder('word').file('document.xml', xuxinye_parts.xuxinye_document);
  const xuxinye_buffer = await xuxinye_zip.generateAsync({ type: 'nodebuffer' });
  fs.writeFileSync(xuxinye_OUTPUT, xuxinye_buffer);
  return xuxinye_OUTPUT;
}

module.exports = { xuxinye_generateSampleDocx };

if (require.main === module) {
  xuxinye_generateSampleDocx()
    .then(function (xuxinye_output) {
      console.log('[xuxinye] 示例 docx 已生成：' + xuxinye_output);
    })
    .catch(function (xuxinye_error) {
      console.error('[xuxinye] 示例 docx 生成失败：' + xuxinye_error.message);
      process.exit(1);
    });
}
