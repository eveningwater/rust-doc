// 这个库不是标准库，所以需要下载依赖
// use rand::Rng;
// 引入比较数字的顺序库
// use std::cmp::Ordering;
// 引入io库，来自std库，这是一个标准库
use std::io;
fn main() {
    println!("Guess the number!");
    println!("please input your guess!");
    let mut guess = String::new();
    io::stdin().read_line(&mut guess).expect("failed to read_line");
    println!("You guessed:{}",guess);
    // println!("开始猜数字!");
    // // 定义一个随机秘密数，让用户来猜测
    // let secret_number = rand::thread_rng().gen_range(1, 101);
    // loop {
    //     println!("请输入你要猜测的数字!");
    //     // 定义一个返回字符串类型的构造函数，并赋值给变量guess,mut关键字代表变量是可变的
    //     let mut guess = String::new();
    //     // 终端读取这个变量并输出,如果没有在开头引入io库，这里就需要加上std::,&表示引入这个变量
    //     // expect方法加上就不会提示警告
    //     io::stdin().read_line(&mut guess).expect("读取失败!");
    //     // u32:无符号的32位整型，trim表示消除字符串两端空白，parse方法表示将字符串转换为数字类型
    //     let guess: u32 = match guess.trim().parse() {
    //         Ok(num) => num,
    //         Err(_) => continue,
    //     };
    //     println!("你猜的数字是:{}", guess);
    //     // 与用户输入的数字做比较，会返回三种类型的值
    //     match guess.cmp(&secret_number) {
    //         Ordering::Less => println!("你输入的数字小了!"),
    //         Ordering::Greater => println!("你输入的数字大了!"),
    //         Ordering::Equal => {
    //             println!("恭喜你，猜对了!");
    //             // 猜对了代表程序已经完成，直接使用break语句会让程序自动退出
    //             break;
    //         }
    //     }
    // }
}
