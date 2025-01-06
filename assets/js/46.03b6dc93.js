(window.webpackJsonp=window.webpackJsonp||[]).push([[46],{392:function(s,t,a){"use strict";a.r(t);var n=a(17),e=Object(n.a)({},(function(){var s=this,t=s._self._c;return t("ContentSlotsDistributor",{attrs:{"slot-key":s.$parent.slotKey}},[t("h2",{attrs:{id:"match-控制流构造"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#match-控制流构造"}},[s._v("#")]),s._v(" match 控制流构造")]),s._v(" "),t("p",[s._v("Rust 有一个非常强大的控制流构造，称为 match，它允许你将一个值与一系列模式进行比较，然后根据模式匹配执行代码。模式可以由文字值、变量名、通配符和许多其他内容组成；第 18 章介绍了所有不同类型的模式及其作用。match 的强大之处在于模式的表达能力以及编译器确认所有可能的情况都得到处理的事实。")]),s._v(" "),t("p",[s._v("可以将匹配表达式想象成一台硬币分类机：硬币沿着轨道滑下，轨道上有各种大小的孔，每枚硬币都会从它遇到的第一个适合它的孔中掉落。同样，值也会在匹配中经历每个模式，在值“适合”的第一个模式中，该值会落入关联的代码块中，以便在执行期间使用。")]),s._v(" "),t("p",[s._v("说到硬币，让我们用 match 来举例！我们可以编写一个函数，接受一个未知的美国硬币，并以与计数机类似的方式确定它是哪种硬币并返回其价值（以美分为单位），如示例 6-3 所示。")]),s._v(" "),t("div",{staticClass:"language-rust extra-class"},[t("pre",{pre:!0,attrs:{class:"language-rust"}},[t("code",[t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("enum")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token type-definition class-name"}},[s._v("Coin")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n    "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("Penny")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("\n    "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("Nickel")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("\n    "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("Dime")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("\n    "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("Quarter")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n\n"),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("fn")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token function-definition function"}},[s._v("value_in_cents")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("coin"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(":")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("Coin")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("->")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("u8")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n    "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("match")]),s._v(" coin "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n        "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("Coin")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("::")]),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("Penny")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=>")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("1")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("\n        "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("Coin")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("::")]),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("Nickel")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=>")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("5")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("\n        "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("Coin")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("::")]),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("Dime")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=>")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("10")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("\n        "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("Coin")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("::")]),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("Quarter")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=>")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("25")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("\n    "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n")])])]),t("p",[s._v("示例 6-3：一个枚举和一个以枚举的变体作为模式的匹配表达式")])])}),[],!1,null,null,null);t.default=e.exports}}]);