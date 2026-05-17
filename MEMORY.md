
## 图片生成架构（2026-05-17 更新）
- **Provider**：火山引擎 Seedream 4.0（图生图专用）
- **Endpoint**：`POST https://ark.cn-beijing.volces.com/api/v3/images/generations`
- **Model**：`doubao-seedream-4-0-250828`
- **API Key**：`57e448e2-545c-4c0e-a47b-b49e3ff3feef`（已内置代码）
- **价格**：约 0.2 元/张，需去火山引擎续费
- **必传参数**：`reference_images`（至少 1 张参考图），不支持纯文生图
- **image_size**：`"1K"`（1024x1024）或 `"2K"`（2048x2048），默认 `"2K"`
- **支持类型**：main / detail / feature / scene / packaging
- **Fallback**：之前有 MXAPI Nano Banana兜底方案（0.07元/张），但已放弃不用
- **旧代码**：CozeClient 类已废弃，仅保留 ImageGenClient
- **前端兼容**：返回格式不变，无需改动
