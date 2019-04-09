### 安装(ubuntu)
```bash
// 卸载老版本
sudo apt-get remove docker docker-engine docker.io containerd runc

// 更新apt包
sudo apt-get update

// 安装可通过https安装软件源
sudo apt-get install linux-image-extra-$(uname -r)
sudo apt-get install apt-transport-https
sudo apt-get install ca-certificates
sudo apt-get install curl
sudo apt-get install software-properties-common

// 增加docker官方GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

// 增加软件安装源地址
sudo add-apt-repository "deb [arch=amd64] https://mirrors.ustc.edu.cn/docker-ce/linux/ubuntu $(lsb_release -cs) stable"

// 更新apt包
sudo apt-get update

// 安装最新的docker和容器
sudo apt-get install docker-ce docker-ce-cli containerd.io

// 测试安装
sudo docker run hello-world
```

### 卸载
```bash
sudo apt-get purge docker-ce
sudo rm -rf /var/lib/docker
```