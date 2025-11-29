# 域名DNS配置指南 - ndtool.cn

## 🎯 目标
将域名 `ndtool.cn` 解析到华为云服务器 `113.45.64.145`

---

## 📋 前提条件

- ✅ 已拥有域名：ndtool.cn
- ✅ 服务器IP：113.45.64.145
- ✅ 网站已部署在服务器上
- ✅ 知道域名注册商（阿里云、腾讯云、华为云等）

---

## 🚀 DNS配置步骤

### 方式一：阿里云域名解析（最常见）

#### 1. 登录阿里云域名控制台
访问：https://dc.console.aliyun.com/

或者：
1. 登录 https://www.aliyun.com/
2. 进入"控制台"
3. 搜索"域名"或找到"域名与网站" → "域名"

#### 2. 找到域名 ndtool.cn
在域名列表中找到 `ndtool.cn`，点击右侧的 **"解析"** 按钮

#### 3. 添加DNS解析记录

**记录1：主域名解析（必需）**
```
记录类型：A
主机记录：@
解析线路：默认
记录值：  113.45.64.145
TTL：     600 或 10分钟
```

**记录2：www子域名解析（推荐）**
```
记录类型：A
主机记录：www
解析线路：默认
记录值：  113.45.64.145
TTL：     600 或 10分钟
```

#### 4. 保存配置
点击"确定"或"添加"按钮，解析记录立即生效

---

### 方式二：腾讯云域名解析

#### 1. 登录腾讯云控制台
访问：https://console.cloud.tencent.com/domain

#### 2. 找到域名
在"我的域名"列表中找到 `ndtool.cn`，点击 **"解析"**

#### 3. 添加记录
点击 **"添加记录"**

**主域名**
```
主机记录：@
记录类型：A
线路类型：默认
记录值：  113.45.64.145
TTL：     600
```

**www子域名**
```
主机记录：www
记录类型：A
线路类型：默认
记录值：  113.45.64.145
TTL：     600
```

---

### 方式三：华为云域名解析

#### 1. 登录华为云控制台
访问：https://console.huaweicloud.com/dns/

或者在控制台搜索"云解析服务 DNS"

#### 2. 进入域名解析
1. 点击左侧 **"域名解析"** → **"公网域名"**
2. 找到 `ndtool.cn` 或点击 **"添加公网域名"**

#### 3. 添加解析记录集
点击域名进入详情，然后点击 **"添加记录集"**

**主域名**
```
主机记录：@
类型：    A - 将域名指向IPv4地址
线路类型：全网默认
TTL：     5分钟
值：      113.45.64.145
```

**www子域名**
```
主机记录：www
类型：    A
线路类型：全网默认
TTL：     5分钟
值：      113.45.64.145
```

---

### 方式四：其他域名注册商

#### Cloudflare
1. 登录 https://dash.cloudflare.com/
2. 选择域名 `ndtool.cn`
3. 进入 DNS 管理
4. 添加 A 记录：
   - Name: `@` → Value: `113.45.64.145`
   - Name: `www` → Value: `113.45.64.145`

#### GoDaddy
1. 登录 https://dcc.godaddy.com/
2. 找到域名，点击 DNS
3. 添加 A 记录（同上）

#### NameSilo / Namesquad 等
操作类似，都是添加 A 记录指向 `113.45.64.145`

---

## 🔍 DNS配置参数说明

### 记录类型解释

| 记录类型 | 说明 | 使用场景 |
|---------|------|---------|
| **A** | 将域名指向IPv4地址 | **本次使用** - 指向服务器IP |
| AAAA | 将域名指向IPv6地址 | IPv6网络 |
| CNAME | 将域名指向另一个域名 | CDN加速 |
| MX | 邮件服务器记录 | 企业邮箱 |
| TXT | 文本记录 | 域名验证 |

### 主机记录说明

| 主机记录 | 效果 | 示例 |
|---------|------|------|
| **@** | 代表主域名本身 | `ndtool.cn` |
| **www** | www子域名 | `www.ndtool.cn` |
| * | 泛解析（所有子域名） | `*.ndtool.cn` |
| mail | 邮件子域名 | `mail.ndtool.cn` |

### TTL说明
- **TTL** = Time To Live（生存时间）
- 推荐值：**600秒（10分钟）** 或 **300秒（5分钟）**
- 意义：DNS记录更新后，在TTL时间内全球生效
- 配置中可选：600秒生效快，3600秒缓存时间长

---

## ✅ 配置示例总结

### 最小配置（必需）
```
记录类型  主机记录  记录值              TTL
A        @        113.45.64.145      600
```
效果：`ndtool.cn` → `113.45.64.145`

### 推荐配置
```
记录类型  主机记录  记录值              TTL
A        @        113.45.64.145      600
A        www      113.45.64.145      600
```
效果：
- `ndtool.cn` → `113.45.64.145`
- `www.ndtool.cn` → `113.45.64.145`

### 完整配置（可选）
```
记录类型  主机记录  记录值              TTL
A        @        113.45.64.145      600
A        www      113.45.64.145      600
CNAME    *        @                  600
```
效果：所有子域名都指向主域名

---

## 🧪 验证DNS是否生效

### 方法1：使用命令行工具（Linux/Mac）

```bash
# 查询主域名
nslookup ndtool.cn

# 查询www子域名
nslookup www.ndtool.cn

# 或使用dig命令
dig ndtool.cn
dig www.ndtool.cn

# 使用host命令
host ndtool.cn
host www.ndtool.cn
```

**正确结果示例：**
```
Server:		8.8.8.8
Address:	8.8.8.8#53

Non-authoritative answer:
Name:	ndtool.cn
Address: 113.45.64.145
```

### 方法2：使用Windows命令

```cmd
# 打开CMD或PowerShell
nslookup ndtool.cn
nslookup www.ndtool.cn

# 或使用ping
ping ndtool.cn
ping www.ndtool.cn
```

### 方法3：使用在线工具

**推荐在线DNS查询工具：**

1. **站长工具**
   - https://tool.chinaz.com/dns/
   - 输入：ndtool.cn
   - 查看解析结果

2. **DNSChecker**（全球DNS检测）
   - https://dnschecker.org/
   - 输入：ndtool.cn
   - 查看全球各地DNS解析情况

3. **阿里云DNS检测**
   - https://zijian.aliyun.com/
   - 域名健康检测

4. **腾讯云DNS检测**
   - https://console.cloud.tencent.com/cns/detail

### 方法4：直接浏览器访问

```
http://ndtool.cn
http://www.ndtool.cn
```

如果能正常打开网站，说明DNS已生效！

---

## ⏱️ DNS生效时间

### 理论生效时间
- **最快**：5-10分钟
- **一般**：10-30分钟
- **完全生效**：24-48小时（全球所有DNS服务器）

### 影响因素
1. **TTL设置**：TTL越短，生效越快
2. **DNS服务商**：不同服务商传播速度不同
3. **本地DNS缓存**：清除本地缓存加速生效
4. **地理位置**：不同地区DNS服务器更新速度不同

### 加速DNS生效的方法

**1. 清除本地DNS缓存**

Linux/Mac：
```bash
sudo systemd-resolve --flush-caches  # Ubuntu/Debian
sudo dscacheutil -flushcache         # macOS
```

Windows：
```cmd
ipconfig /flushdns
```

**2. 临时修改本地hosts文件（测试用）**

编辑hosts文件：
- Linux/Mac: `/etc/hosts`
- Windows: `C:\Windows\System32\drivers\etc\hosts`

添加：
```
113.45.64.145  ndtool.cn
113.45.64.145  www.ndtool.cn
```

**注意**：这只是临时测试，实际用户还是需要DNS生效

---

## 🔒 配置HTTPS（DNS生效后）

DNS生效后，建议配置SSL证书启用HTTPS：

### 使用Let's Encrypt免费证书

登录服务器执行：

```bash
# 1. 安装Certbot
apt update
apt install -y certbot python3-certbot-nginx

# 2. 获取SSL证书（DNS必须已生效）
certbot --nginx -d ndtool.cn -d www.ndtool.cn

# 按提示输入邮箱，同意协议
# 选择是否重定向HTTP到HTTPS（推荐选择2 - 自动重定向）

# 3. 设置自动续期
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -

# 4. 测试自动续期
certbot renew --dry-run
```

### SSL证书配置后

网站将支持：
- ✅ `https://ndtool.cn`
- ✅ `https://www.ndtool.cn`
- ✅ 自动将HTTP重定向到HTTPS
- ✅ 证书自动续期（每90天）

---

## 📝 完整操作清单

### DNS配置步骤：
- [ ] 1. 登录域名注册商控制台
- [ ] 2. 找到域名 `ndtool.cn` 的DNS管理
- [ ] 3. 添加A记录：`@` → `113.45.64.145`
- [ ] 4. 添加A记录：`www` → `113.45.64.145`
- [ ] 5. 保存配置

### 验证步骤：
- [ ] 6. 等待5-30分钟
- [ ] 7. 使用 `nslookup ndtool.cn` 验证
- [ ] 8. 浏览器访问 `http://ndtool.cn`
- [ ] 9. 浏览器访问 `http://www.ndtool.cn`

### HTTPS配置（可选但推荐）：
- [ ] 10. 确认DNS已生效
- [ ] 11. SSH登录服务器
- [ ] 12. 运行Certbot获取SSL证书
- [ ] 13. 配置自动续期
- [ ] 14. 访问 `https://ndtool.cn` 验证

---

## 🆘 常见问题

### Q1: DNS配置后无法访问？
**A**: 
1. 检查DNS是否生效：`nslookup ndtool.cn`
2. 确认服务器nginx已启动：`systemctl status nginx`
3. 检查安全组80端口已开放
4. 清除浏览器缓存和DNS缓存

### Q2: 只能通过IP访问，域名无法访问？
**A**: 
1. DNS可能还未生效，等待更长时间
2. 使用在线工具检测DNS：https://tool.chinaz.com/dns/
3. 尝试使用其他网络（如手机流量）访问

### Q3: www可以访问，但不带www无法访问？
**A**: 
检查是否添加了 `@` 主机记录的A记录

### Q4: SSL证书申请失败？
**A**: 
1. 确认DNS已完全生效
2. 确认80端口可访问
3. 检查域名解析是否正确指向服务器IP

### Q5: 域名在国内，需要备案吗？
**A**: 
- 如果使用国内服务器（华为云国内），**必须备案**
- 您的服务器在华为云华南（广州），属于国内服务器
- 需要完成ICP备案才能正式使用域名

---

## 🏛️ 域名备案流程（国内必需）

### 华为云ICP备案

1. **访问华为云备案系统**
   - https://beian.huaweicloud.com/

2. **准备材料**
   - 身份证正反面照片
   - 域名证书
   - 服务器信息（ECS实例信息）
   - 网站负责人照片

3. **备案流程**
   ```
   填写备案信息 → 上传资料 → 初审（1-2天）
   → 拍照核验 → 管局审核（7-20天） → 备案完成
   ```

4. **备案期间**
   - 可以使用IP访问：`http://113.45.64.145`
   - 域名暂时无法使用
   - 备案通过后域名才能正常使用

---

## 📞 需要帮助？

如果配置过程中遇到问题：
1. 截图当前配置界面
2. 提供域名注册商名称
3. 提供遇到的错误信息

我会继续协助您！

---

## 🎉 配置成功标志

当以下条件都满足时，说明DNS配置成功：

✅ `nslookup ndtool.cn` 返回 `113.45.64.145`
✅ `nslookup www.ndtool.cn` 返回 `113.45.64.145`
✅ 浏览器访问 `http://ndtool.cn` 能打开网站
✅ 浏览器访问 `http://www.ndtool.cn` 能打开网站
✅ （可选）`https://ndtool.cn` 能访问且显示安全锁

---

## 🚀 快速参考

### 最快捷的配置方式（阿里云示例）：

1. 登录 https://dc.console.aliyun.com/
2. 找到 `ndtool.cn` → 点击"解析"
3. 添加两条A记录：
   - `@` → `113.45.64.145`
   - `www` → `113.45.64.145`
4. 等待10分钟
5. 访问 `http://ndtool.cn`

就这么简单！🎉
