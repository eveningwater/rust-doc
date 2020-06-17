fn main() {
    // loop {
    //     println!("请输入0~48之内的整数数字!");
    //     let mut guess = String::new();
    //     std::io::stdin().read_line(&mut guess).expect("");
    //     let index: u32 = match guess.trim().parse() {
    //         Ok(num) => num,
    //         Err(_) => {
    //             continue;
    //         },
    //     };
    //     if index >= 48 {
    //         println!("输入的整数数字太大，程序算不出来,请输入小于48的整数!");
    //         continue;
    //     }else if index <= 0 {
    //         println!("输入的整数不能小于0!");
    //         continue;
    //     }
    //     println!("{}", fb(index));
    //     println!("{}","即将关闭程序!");
    //     break;
    // }
    // console_value(10,11);
    // for_value();
    // h_to_s_tem(50.0);
    // s_to_h_tem(10.0);
    print_lyrics();
}
fn print_lyrics() {
    let order_day_arr = [
        "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth",
        "tenth", "eleventh", "twelfth",
    ];
    let mut lyric = " A partridge in a pear tree.".to_string();
    let mut i = 0;
    while i <= 12 {
        if index == 1 {
            lyric = "Two turtle doves, And ".to_string() + &lyric;
        } else if index == 2 {
            lyric = "Three French hens,".to_string() + &lyric;
        } else if index == 3 {
            lyric = "Four calling birds,".to_string() + &lyric;
        } else if index == 4 {
            lyric = "Five golden rings,".to_string() + &lyric;
        } else if index == 5 {
            lyric = "Six geese a-laying,".to_string() + &lyric;
        } else if index == 6 {
            lyric = "Seven swans a-swimming,".to_string() + &lyric;
        } else if index == 7 {
            lyric = "Eight maids a-milking,".to_string() + &lyric;
        } else if index == 8 {
            lyric = "Nine ladies dancing,".to_string() + &lyric;
        } else if index == 9 {
            lyric = "Ten lords a-leaping,".to_string() + &lyric;
        } else if index == 10 {
            lyric = "Eleven pipers piping,".to_string() + &lyric;
        } else if index == 11 {
            lyric = "Twelve drummers drumming,".to_string() + &lyric;
        }
        println!(
            "On the {} day of Christmas,my true love sent to me: {}\n",
            order_day_arr[i], lyric
        );
        i += 1;
    }
    // for index in 0..12 {
    //     if index == 1 {
    //         lyric = "Two turtle doves, And ".to_string() + &lyric;
    //     } else if index == 2 {
    //         lyric = "Three French hens,".to_string() + &lyric;
    //     } else if index == 3 {
    //         lyric = "Four calling birds,".to_string() + &lyric;
    //     } else if index == 4 {
    //         lyric = "Five golden rings,".to_string() + &lyric;
    //     } else if index == 5 {
    //         lyric = "Six geese a-laying,".to_string() + &lyric;
    //     } else if index == 6 {
    //         lyric = "Seven swans a-swimming,".to_string() + &lyric;
    //     } else if index == 7 {
    //         lyric = "Eight maids a-milking,".to_string() + &lyric;
    //     } else if index == 8 {
    //         lyric = "Nine ladies dancing,".to_string() + &lyric;
    //     } else if index == 9 {
    //         lyric = "Ten lords a-leaping,".to_string() + &lyric;
    //     } else if index == 10 {
    //         lyric = "Eleven pipers piping,".to_string() + &lyric;
    //     } else if index == 11 {
    //         lyric = "Twelve drummers drumming,".to_string() + &lyric;
    //     }
    //     println!(
    //         "On the {} day of Christmas,my true love sent to me: {}\n",
    //         order_day_arr[index], lyric
    //     );
    // }
}
// fn fb(n: u32) -> u32 {
//     return if n <= 2 { 1 } else { fb(n - 1) + fb(n - 2) };
// }
// 华式温度转成摄氏温度
// fn h_to_s_tem(h: f32) {
//     let res = {
//         let x = h - 32.0;
//         x / 1.8
//     };
//     println!("你输入的摄氏温度是:{}", res);
// }
// // 摄氏温度转换成华式温度
// fn s_to_h_tem(s: f32) {
//     let res = {
//         let x = s * 1.8;
//         x + 32.0
//     };
//     println!("你输入的华式温度是:{}", res);
// }
// fn console_value(x:u32,y:u32){
//     let z = {
//         let k = 12;
//          k * 10
//     };
//     // 1200 * 10 * 11 + 180
//     let res = x * z * y + const_value(80);
//     println!("结果是:{}",res);
// }

// fn const_value(a:u32) -> u32 {
//     a + 100
// }
// fn for_value(){
//     // let a = [1,2,3,4,5];
//     // let b = a.iter();
//     // for index in b {
//     //     println!("循环遍历:{}",index);
//     // }
//     for j in (1..100).rev() {
//         println!("值是:{}",j);
//     }
// }
