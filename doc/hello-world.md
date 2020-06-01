### hello,world

现在你已经安装了Rust，让我们编写第一个Rust程序。 在学习一种新语言时编写一个小的程序以打印文本“ Hello，world！”到屏幕上，是一种传统。所以我们在这里做同样的事情！

>注意：本书假定你基本熟悉命令行。Rust对你的编辑或工具或代码所在的位置没有特殊要求，因此，如果你更喜欢使用集成开发环境（IDE）而不是命令行，请随时使用自己喜欢的IDE。现在，许多IDE都提供了一定程度的Rust支持。有关详细信息，请查看IDE的文档。 最近，Rust团队一直致力于实现出色的IDE支持，并且在这方面已经取得了迅速的进步！

### 创建项目目录

首先，创建一个目录来存储你的Rust代码。 对于Rust来说，你的代码位于哪里并不重要，但是对于本文档中的练习和项目，我们建议在你的主目录中创建一个`projects`目录，并将所有项目保存在该目录中。

打开终端，输入以下命令以创建项目目录和在项目目录中的项目“ Hello，world！”目录。

对于Windows上的PowerShell，Linux和macOS，请输入以下命令：

```js
$ mkdir ~/projects
$ cd ~/projects
$ mkdir hello_world
$ cd hello_world
```
对于Windows CMD，请输入以下命令:

```js
> mkdir "%USERPROFILE%\projects"
> cd /d "%USERPROFILE%\projects"
> mkdir hello_world
> cd hello_world

```

如下图所示:

![hello,word](./images/hello-world-1.png)

### 编写和运行一个Rust运行程序

接下来，创建一个新的源文件并将其命名为`main.rs`。Rust文件始终以`.rs`扩展名结尾。如果文件名中使用多个单词，请使用下划线将其分开。例如，使用`hello_world.rs`而不是`helloworld.rs`。

现在打开刚刚创建的`main.rs`文件，并第一行中输入代码。

文件名:main.rs:

```rust
  fn main(){
      println!("hello,world!");
  }
```