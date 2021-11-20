use std::rc::Rc;
use std::cell::RefCell;
fn main() {
    // println!("Hello, eveningwater!");
    // let vector = vec![5,7,7,8,8,10];
    // let target = 8;
    // println!("{}",search(vector,target));
}
#[derive(Debug, PartialEq, Eq)]
pub struct TreeNode {
  pub val: i32,
  pub left: Option<Rc<RefCell<TreeNode>>>,
  pub right: Option<Rc<RefCell<TreeNode>>>,
}

impl TreeNode {
  #[inline]
  pub fn new(val: i32) -> Self {
    TreeNode {
      val,
      left: None,
      right: None
    }
  }
}
fn kth_largest(root: Option<Rc<RefCell<TreeNode>>>, k: i32) -> i32 {
    fn dfs(node: Option<Rc<RefCell<TreeNode>>>, values: &mut Vec<i32>) {
        let node = node.as_ref().unwrap().borrow();
        if node.right.is_some() { dfs(node.right.clone(), values); }
        values.push(node.val);
        if node.left.is_some() { dfs(node.left.clone(), values); }
    }

    let mut values = vec![];
    dfs(root, &mut values);
    values[k as usize - 1]
}
// fn search(num_vec:Vec<i32>,target:i32) -> i32 {
//     if num_vec.is_empty() {
//         return 0;
//     }
//     if num_vec.len() == 1{
//         if num_vec[0] == target {
//             return 1;
//         }else{
//             return 0;
//         }
//     }
//     return helper(&num_vec, target) - helper(&num_vec, target - 1);
// }
// fn helper(num_vec:&[i32],target:i32) -> i32 {
//     let mut l = 0;
//     let mut r = num_vec.len() - 1;
//     while l <= r {
//         let m = (l + r) / 2;
//         if m > r {
//             break;
//         }
//         if num_vec[m] <= target {
//             l = m + 1;
//         }else {
//             r = m - 1;
//         }
//     }
//     return l as i32;
// }
