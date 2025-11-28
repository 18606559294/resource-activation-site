# 🚀 Cpolar 内网穿透配置指南

## ✅ Cpolar 已安装成功！

版本：cpolar 3.2.62

---

## 📋 重要说明：访客无需密码！

### 访问方式对比

| 角色 | 需要做什么 |
|------|-----------|
| **你（管理员）** | 注册账号、配置一次 authtoken（仅配置时） |
| **访客** | **直接访问网址，无需任何密码或密钥！** |

**就像访问百度、淘宝一样简单，任何人都可以直接浏览你的网站！**

---

## 🎯 配置步骤（只需做一次）

### 步骤 1：注册 Cpolar 账号

1. 访问：https://dashboard.cpolar.com/signup
2. 使用邮箱注册（免费）
3. 验证邮箱

### 步骤 2：获取 Authtoken

1. 登录 Cpolar 控制台：https://dashboard.cpolar.com/
2. 左侧菜单找到 **"验证"** 或 **"Authtoken"**
3. 复制你的 token（类似：`xxxxx-xxxx-xxxx-xxxx-xxxxx`）

### 步骤 3：配置 Authtoken（在终端运行）

```bash
cpolar authtoken YOUR_TOKEN_HERE
```

将 `YOUR_TOKEN_HERE` 替换成你复制的 token

### 步骤 4：启动 Cpolar

```bash
# 启动内网穿透（映射本地 80 端口）
cpolar http 80
```

启动后会显示类似：
```
Forwarding                    https://xxxx.cpolar.cn -> http://localhost:80
```

**这个地址就是公网访问地址！任何人都可以直接访问！**

---

## 🌐 绑定自定义域名 ndtool.cn

### 在 Cpolar 控制台配置

1. 登录 https://dashboard.cpolar.com/
2. 进入 **"隧道管理"**
3. 点击 **"创建隧道"**
4. 配置：
   - 隧道名称：ndtool
   - 协议：HTTP
   - 本地地址：80
   - 域名类型：自定义域名
   - 域名：ndtool.cn

### 在阿里云域名控制台配置

1. 登录阿里云域名控制台
2. 进入 **ndtool.cn** 的解析设置
3. 添加 CNAME 记录：
   - 记录类型：CNAME
   - 主机记录：@
   - 记录值：Cpolar 提供的 CNAME 地址（从控制台获取）
   - TTL：600

4. 添加 www 记录：
   - 记录类型：CNAME
   - 主机记录：www
   - 记录值：同上
   - TTL：600

### 等待 DNS 生效

- 通常需要 10-30 分钟
- 生效后访问 http://ndtool.cn 即可

---

## 🔧 Cpolar 管理命令

### 启动服务
```bash
# HTTP 协议
cpolar http 80

# 后台运行
nohup cpolar http 80 > /dev/null 2>&1 &

# 使用配置文件启动
cpolar start ndtool
```

### 查看运行状态
```bash
# 查看所有隧道
cpolar status

# 查看特定隧道
cpolar status ndtool
```

### 停止服务
```bash
# 停止所有隧道
pkill cpolar

# 或者按 Ctrl+C 停止
```

### Web 管理界面
Cpolar 启动后，访问：
- http://localhost:9200

可以查看实时状态、请求日志等

---

## 📱 访问测试

### 启动后测试流程

1. **启动 Cpolar**
   ```bash
   cpolar http 80
   ```

2. **获取公网地址**
   启动后显示的 `https://xxxx.cpolar.cn`

3. **在手机或其他设备测试**
   - 直接在浏览器输入地址
   - 无需密码，直接访问
   - 应该能看到你的网站

4. **分享给朋友**
   - 把地址发给任何人
   - 他们直接访问即可
   - 无需任何配置或密码

---

## 💡 自动启动配置

### 创建系统服务（开机自启）

1. 创建服务文件：
```bash
sudo nano /etc/systemd/system/cpolar.service
```

2. 添加以下内容：
```ini
[Unit]
Description=Cpolar Tunnel Service
After=network.target

[Service]
Type=simple
User=hongfuyang
ExecStart=/usr/local/bin/cpolar http 80
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

3. 启用并启动服务：
```bash
sudo systemctl daemon-reload
sudo systemctl enable cpolar
sudo systemctl start cpolar
```

4. 查看状态：
```bash
sudo systemctl status cpolar
```

---

## 🆓 免费版 vs 付费版

### 免费版功能
- ✅ HTTP/HTTPS 隧道
- ✅ 随机域名（如 xxxx.cpolar.cn）
- ✅ 1个在线隧道
- ✅ 不限流量
- ⚠️ 域名会变化（重启后）
- ⚠️ 自定义域名需要付费

### VIP版功能（约 10 元/月）
- ✅ 固定域名
- ✅ 自定义域名绑定
- ✅ 多个隧道
- ✅ TCP/UDP 隧道
- ✅ 不限流量

**建议**：先用免费版测试，确认满足需求后再考虑升级

---

## 🎯 完整使用流程

### 一次性配置（只需做一次）
1. ✅ 注册 Cpolar 账号
2. ✅ 获取并配置 authtoken
3. ✅ （可选）升级 VIP 并配置自定义域名

### 日常使用
1. 开机启动电脑
2. 运行：`cpolar http 80`（或配置自动启动）
3. 获取访问地址（或使用固定域名）
4. 分享给任何人访问

### 访客使用
1. 打开浏览器
2. 输入网址
3. **直接访问，无需任何密码！**

---

## 🔒 安全说明

### Cpolar 只是转发流量
- Cpolar 充当"桥梁"角色
- 不存储你的网站内容
- 访客直接连接到你的本地服务器
- 所有数据都是加密传输（HTTPS）

### 访问控制（可选）
如果你想限制访问，可以：
1. 在 Cpolar 控制台设置 IP 白名单
2. 在网站中添加登录功能
3. 使用 Nginx 的 HTTP 认证

但**默认情况下，网站是公开的，任何人都可以访问**

---

## 🆘 常见问题

### Q: 访客需要密码吗？
**A: 不需要！访客直接访问网址即可，就像访问普通网站一样。**

### Q: 每次重启地址会变吗？
A: 免费版会变，VIP 版可以固定域名

### Q: 可以绑定我的域名 ndtool.cn 吗？
A: 可以，但需要升级 VIP（约 10 元/月）

### Q: 访问速度如何？
A: 国内服务器，速度很快，延迟通常在 50ms 以内

### Q: 稳定吗？
A: Cpolar 是国内主流服务，稳定性很好

### Q: 电脑关机了还能访问吗？
A: 不能，本地电脑需要保持开机

---

## 📞 获取帮助

- Cpolar 官网：https://www.cpolar.com/
- 控制台：https://dashboard.cpolar.com/
- 文档：https://www.cpolar.com/docs

---

## 🎊 下一步

配置完成后，运行：
```bash
cpolar http 80
```

然后访问显示的公网地址，就能看到你的网站了！

**任何人都可以直接访问，无需任何密码或配置！**
