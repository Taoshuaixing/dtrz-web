import { Component, OnDestroy, AfterViewInit, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { environment } from '@env/environment';

@Component({
  selector: 'simple-tiny',
  templateUrl: './myeditor.component.html',
})
export class MyeditorComponent implements OnInit {
  @Input() elementId: String;
  @Input() setItemObject: Object;
  @Input() setItemAttr: String;
  @Input() width: String;
  @Input() height: String;
  @Input() readonly: Number;
  @Output() editorOk = new EventEmitter();

  initConfig: any;
  @Input() html: any;

  ngOnInit() {
    this.initTinymce();

    if (this.html && this.html.length > 0) {
      this.editorOk.emit({ setItemObject: this.setItemObject, setItemAttr: this.setItemAttr, content: this.html });
    } else {
      this.editorOk.emit({ setItemObject: this.setItemObject, setItemAttr: this.setItemAttr, content: '' });
    }
  }

  // 初始化组件
  initTinymce() {
    if (!this.width) {
      this.width = 'auto';
    }
    if (!this.height) {
      this.height = '400';
    }
    this.readonly = this.readonly === 1 ? 1 : 0;

    const commonConfig = {
      // 高度 max_height, max_width, min_height, min_width
      min_height: 400,

      width: this.width,
      height: this.height,
      readonly: this.readonly,
      content_style: `
      @font-face {
        font-family: '楷体_GB2312';
        mso-font-alt: 楷体;
        mso-font-charset: 134;
        mso-generic-font-family: modern;
        mso-font-pitch: fixed;
        mso-font-signature: 1 135135232 16 0 262144 0;
        src: local('Kaiti TC Regular'), local(STKaiTi-TC-Regular), local('Kaiti TC'), local('Kaiti SC'), local(STKaiti),
          local(BiauKai), local('標楷體'), local(DFKaiShu-SB-Estd-BF), local(Kaiti), local(DFKai-SB);
      }

      @font-face {
        font-family: '仿宋_GB2312';
        mso-font-alt: 仿宋;
        mso-font-charset: 134;
        mso-generic-font-family: modern;
        mso-font-pitch: fixed;
        mso-font-signature: 1 135135232 16 0 262144 0;
        src: local('FangSong TC Regular'),local('STFangsong'),local('BiauFangsong'), local(Fangsong), local(Fangsong-SB);
      }

      @font-face {
        font-family: '方正小标宋简体';
        mso-font-alt: 'Arial Unicode MS';
        mso-font-charset: 134;
        mso-generic-font-family: auto;
        mso-font-pitch: variable;
        mso-font-signature: 0 407858426 18 0 262145 0;
        src:  url(./assets/fonts/方正小标宋.ttf);;
      }
      @font-face {
        font-family: '华文中宋';
        mso-font-alt: 'Arial Unicode MS';
        mso-font-charset: 134;
        mso-generic-font-family: auto;
        mso-font-pitch: variable;
        mso-font-signature: 0 407858426 18 0 262145 0;
        src:  url(./assets/fonts/方正小标宋.ttf);;
      }
      `,
    };
    if (this.readonly) {
      this.initConfig = {
        ...commonConfig,
        // 占位符
        placeholder: '',

        // menubar: false,
        toolbar: false,
        // statusbar: false
      };
      return;
    }
    this.initConfig = {
      ...commonConfig,

      // 占位符
      placeholder: '请输入内容',

      // 编辑器底边距
      // autoresize_bottom_margin: 50,

      // 编辑器body部分距离左右2边的距离
      // autoresize_overflow_padding: 50,

      // 皮肤 与assets\library\tinymce\skins\ui 下文件夹对应，
      // 黑色
      // skin: 'oxide-dark',

      // 皮肤路径
      // skin_url: '/css/mytinymceskin'

      // 换行时，是否保留当前样式
      keep_styles: true,

      // html版本
      // 该值默认是html5，可选值还有：html4、html5-strict。
      // html5模式是完整的HTML5规范，它兼容旧的HTML4。html5-strict是HTML5的严格模式，它只允许HTML5规范的元素，不包括已经被移除标准的元素。html4模式则是包括完整的HTML4过渡规范。在需要兼容老旧浏览器时，可能会用到该选项。
      schema: 'html5',

      // 隐藏状态栏 取消底部标签和组件介绍信息 状态栏是与编辑器的可编辑区域底部对齐的灰色栏。状态栏包含路径信息和调整大小手柄。删除状态栏将使用户无法更改可编辑区域的大小。
      statusbar: true,

      // 是否允许改变高度，statusbar必须为true, 默认： true（仅允许改变高度）, false（完全不让你动）, 'both'（宽高都能改变，注意引号）
      resize: true,

      // 禁用状态栏的元素路径显示
      elementpath: false,

      // 禁用状态栏信息 使用该branding选项可以禁用状态栏中显示的“由Tiny提供支持”链接，以进行产品归因。重要提示：免费和开放源代码用户必须提供产品归因。有关TinyMCE归属要求的信息，请参阅：徽标和归属要求。
      branding: false,

      // 编辑区的样式，也可以指定css文件 默认：default dark(暗色背景) document(类似word) writer(类似word，只是比word宽一点)
      // content_css: './myeditor.component.css',
      // content_css: 'document',

      // 语言
      language: 'zh_CN',

      // 浏览器的拼写检查
      // browser_spellcheck: true,

      // 支持鼠标右键的组件
      contextmenu: 'link image table media',

      // 禁用鼠标右键时打开浏览器菜单弹框，配合contextmenu使用，否则右键不弹框
      contextmenu_never_use_native: true,

      // 对话框支持拖动
      draggable_modal: true,

      // 开启拖入功能，true：禁止拖入
      paste_block_drop: false,

      // 允许粘贴图片
      paste_data_images: true,

      // 禁用默认粘贴过滤器
      paste_enable_default_filters: false,
      paste_filter_drop: false,

      // 禁用样式粘贴过滤器
      paste_remove_styles_if_webkit: false,

      // 检测类似于URL的文本，然后将其更改为超链接。
      // 检测类似于图像URL的文本，并尝试用图像替换文本。
      smart_paste: true,

      // 粘贴前的处理
      paste_preprocess: (plugin, args) => {
        // console.log(args.content);
      },

      // 粘贴到组件后，添加dom属性，组件默认添加了div，通过控制台可以看出该位置的div的id为12了
      paste_postprocess: (plugin, args) => {
        // console.log(args.node);
        // args.node.setAttribute('id', '42');
      },

      // 允许粘贴的元素，不管用
      // paste_word_valid_elements: 'strong,h1,h2',

      // 图片高级功能
      image_advtab: true,

      // 图片对话框中上传标签开关，false时只可以输入图片路径，没有上传入口
      image_uploadtab: true,

      // 是否开启图片标题设置的选择，这里设置否
      image_title: false,

      // 启用或禁用自动上传URL或Blob URI表示的图像
      automatic_uploads: true,

      // 自动生成图片名称
      images_reuse_filename: true,

      // 默认图片列表
      // image_list: (success) => {
      //   success([
      //       {title: '狗', value: 'mydog.jpg'},
      //       {title: '猫', value: 'mycat.gif'}
      //   ]);
      // },

      // 图片样式列表
      // image_class_list: [
      //   {title: '无', value: ''},
      //   {title: 'dog', value: 'dog_class'},
      //   {title: 'cat', value: 'cat_class'}
      // ],

      // 是否开启自动保存，退出页面或刷新时提示
      autosave_ask_before_unload: true,

      // 自动保存时间间隔 秒
      autosave_interval: '30s',

      // 本地保存数据的有效期 分
      autosave_retention: '5m',

      // 组件崩溃后是否自动还原最后保存的内容
      autosave_restore_when_empty: true,

      // 自定义快速工具栏
      // quickbars_selection_toolbar: 'bold italic | formatselect | quicklink blockquote',

      // 禁用快速工具栏
      quickbars_selection_toolbar: false,

      // 目录级别个数H1通过H9
      toc_depth: 9,

      // 自定义目录标签包裹，默认是H2
      // toc_header: 'div',

      // 目录样式
      // toc_class: 'myclass',

      // 粘性工具栏（或停靠工具栏），当向下滚动网页直到不再可见编辑器时，会将工具栏和菜单停靠在屏幕顶部。
      toolbar_sticky: true,

      // 工具栏位置 auto，top，bottom
      toolbar_location: 'top',

      // 工具栏的样式 'floating'，'sliding'，'scrolling'，或者'wrap'
      toolbar_mode: 'floating',

      // 从菜单栏中删除菜单
      // removed_menuitems: 'undo, redo',

      // 禁用菜单栏
      // menubar: false,

      // 设置模板，可以写路径，通过后端返回该格式的数组数据
      // templates:'http://192.168.9.22:18085/testAction/getTemplats',
      templates: [
        // content：html字符串数据
        {
          title: 'Some title 1',
          description: 'Some desc 1',
          content:
            '<p style="margin: 0cm; margin-bottom: .0001pt; text-align: center;" align="center"><span style="font-size: 14.0pt; font-family: 黑体;">我的模板1</span></p>',
        },
        // url：html文件
        { title: 'Some title 2', description: 'Some desc 2', url: '../../assets/templates/10218060374200.html' },
      ],

      // 类名称
      template_cdate_classes: 'cdate creationdate',

      // 模板日期格式设置
      template_cdate_format: '%m/%d/%Y - %H:%M:%S',

      // 组件，在这里配置的组件才会生效
      plugins: [
        'toc advlist',
        'autolink lists link image charmap print preview anchor template',
        'searchreplace visualblocks code fullscreen pagebreak media',
        'insertdatetime table paste code help wordcount imagetools directionality autosave emoticons hr searchreplace codesample visualchars',
      ],

      // 工具栏分类
      menubar: 'file edit insert view format table ',

      menu: {
        file: { title: 'File', items: 'newdocument undo redo | preview | print ' },
        edit: { title: 'Edit', items: 'undo redo | cut copy paste | selectall | searchreplace' },
        view: {
          title: 'View',
          items: 'code | visualaid visualchars visualblocks | spellchecker | fullscreen codesample',
        },
        insert: {
          title: 'Insert',
          items:
            'image link media template codesample inserttable | charmap emoticons hr | pagebreak nonbreaking anchor toc | insertdatetime',
        },
        format: {
          title: 'Format',
          items:
            'bold italic underline strikethrough superscript subscript codeformat | formats blockformats fontformats fontsizes align lineheight | forecolor backcolor | removeformat',
        },
        tools: { title: 'Tools', items: 'spellcheckerlanguage | code wordcount' },
        table: { title: 'Table', items: 'inserttable | cell row column | tableprops deletetable' },
        // help: { title: 'Help', items: 'help' },
        // 自定义菜单
        // export: { title: '导出', items: 'word pdf' }
      },

      // 工具栏图标
      // toolbar1:
      //   'undo redo | formatselect | fontselect fontsizeselect lineheight | bold italic underline strikethrough forecolor backcolor | \
      //       alignleft aligncenter alignright alignjustify removeformat | preview template codesample remove selectall link image fullscreen',
      toolbar1:
        'undo redo | formatselect | fontselect fontsizeselect lineheight | bold italic underline strikethrough forecolor backcolor | \
              alignleft aligncenter alignright alignjustify removeformat  ',
      // toolbar2:
      //   'bullist numlist quicktable outdent indent | anchor restoredraft emoticons hr pagebreak searchreplace toc  image fullscreen',
      toolbar2: 'bullist numlist quicktable outdent indent |   image fullscreen',

      // 自定义菜单按钮 https://www.tiny.cloud/docs/ui-components/menuitems/#howtocreatecustommenuitems
      setup: (editor) => {
        // 基本菜单
        editor.ui.registry.addMenuItem('word', {
          text: 'word',
          onAction: () => {
            // this.downWord();
          },
        });
        editor.ui.registry.addMenuItem('pdf', {
          text: 'pdf',
          onAction: () => {
            // this.downPdf();
          },
        });
        editor.on('change', () => {
          const content = editor.getContent();
          this.editorOk.emit({ setItemObject: this.setItemObject, setItemAttr: this.setItemAttr, content: content }); // 通过keyup change事件将textarea 发送到父组件，可以自定义事件
        });
        // 嵌套菜单
        // editor.ui.registry.addNestedMenuItem('nesteditem', {
        //   text: 'My nested menu item',
        //   getSubmenuItems: () => {
        //   return [{
        //     type: 'menuitem',
        //     text: 'My submenu item',
        //     onAction: () => {
        //       alert('Submenu item clicked');
        //     }
        //   }];
        //   }
        // });
        // 切换菜单，如：设置on、off状态的
        // editor.ui.registry.addToggleMenuItem('toggleitem', {
        //   text: 'My toggle menu item',
        //   icon: 'home',
        //   onAction: () => {
        //     this.toggleState = !this.toggleState;
        //     alert('Toggle menu item clicked');
        //   },
        //   onSetup: (api) => {
        //     api.setActive(this.toggleState);
        //     return () => {};
        //   }
        // });
      },

      // 颜色列表列数
      color_cols: 4,
      // 关闭编辑器默认颜色

      // custom_colors: false,

      // 自定义颜色配置 自定义颜色后，不会显示调色板
      // color_map: [
      //     "000000", "Black",
      //     "993300", "Burnt orange",
      //     "333300", "Dark olive",
      //     "003300", "Dark green",
      //     "003366", "Dark azure",
      //     "000080", "Navy Blue",
      //     "333399", "Indigo",
      //     "333333", "Very dark gray",
      //     "800000", "Maroon",
      // ],

      // 撤销次数,默认无限次
      custom_undo_redo_levels: 30,

      // 行高 5.5版本后支持
      lineheight_formats: '1 1.1 1.2 1.3 1.4 1.5 2',

      // 字体
      font_formats:
        '方正小标宋简体;' +
        '黑体=SimHei,serif;' +
        '楷体_GB2312;' +
        '仿宋_GB2312;' +
        '华文中宋;' +
        '宋体=simsun,serif;' +
        '仿宋=FangSong,serif;' +
        '新宋体=NSimSun,serif;' +
        '楷体=KaiTi,serif;' +
        '微软雅黑=Microsoft YaHei,Helvetica Neue,PingFang SC,sans-serif;' +
        '隶书=LiSu,serif;' +
        '幼圆=YouYuan,serif;' +
        '华文细黑=STXihei,serif;' +
        '华文楷体=STKaiti,serif;' +
        '华文宋体=STSong,serif;' +
        // 默认字体
        'Andale Mono=andale mono,times; Arial=arial,helvetica,sans-serif; Arial Black=arial black,avant garde; Book Antiqua=book antiqua,palatino; Comic Sans MS=comic sans ms,sans-serif; Courier New=courier new,courier; Georgia=georgia,palatino; Helvetica=helvetica; Impact=impact,chicago; Symbol=symbol; Tahoma=tahoma,arial,helvetica,sans-serif; Terminal=terminal,monaco; Times New Roman=times new roman,times; Trebuchet MS=trebuchet ms,geneva; Verdana=verdana,geneva; Webdings=webdings; Wingdings=wingdings,zapf dingbats',

      // 字号
      fontsize_formats: '8pt 10pt 12pt 14pt 16pt 18pt 24pt 36pt',

      // 如果表格border为0，TinyMCE会在编辑区内的表格周围添加虚线框作为视觉辅助
      visual: true,

      // 支持本地图片上传
      powerpaste_allow_local_images: true,

      //  此设置控制如何过滤从Microsoft Word粘贴的内容。
      //  clean-保留标题，表格和列表等内容的结构，但删除内联样式和类。这样就产生了使用站点CSS样式表的简单内容，同时保留了原始文档的语义结构。
      //  merge-保留原始文档的内联格式和结构。无效和专有的样式，标记和属性仍会被删除，以确保HTML有效，同时更紧密地匹配原始文档格式。
      //  prompt -在尝试粘贴单词内容后提示用户在“清理”和“合并”选项之间进行选择
      // powerpaste_word_import: 'prompt',
      // powerpaste_html_import: 'prompt',

      // 粘贴为文本按钮的初始状态，开启后，只会粘贴文本内容
      paste_as_text: false,

      // 合并相同元素的内容
      paste_merge_formats: false,

      // 多少空格来表示HTML中的制表符
      paste_tab_spaces: 2,

      // 媒体实时预览开关 开启此选项后，用户可看到编辑区内嵌入视频的实时预览，而不是占位图, 此设置对video无效
      media_live_embeds: true,

      // 自定义媒体样式  http://tinymce.ax-z.cn/plugins/media.php
      video_template_callback: (data) => {
        return (
          '<video width="' +
          data.width +
          '" height="' +
          data.height +
          '"' +
          (data.poster ? ' poster="' + data.poster + '"' : '') +
          ' controls="controls">\n' +
          '<source src="' +
          data.source1 +
          '"' +
          (data.source1mime ? ' type="' + data.source1mime + '"' : '') +
          ' />\n' +
          (data.source2
            ? '<source src="' +
              data.source2 +
              '"' +
              (data.source2mime ? ' type="' + data.source2mime + '"' : '') +
              ' />\n'
            : '') +
          '</video>'
        );
      },

      // 检查URL是否包含特殊内容，如包含则生成自定义的iframe，否则交给插件的默认逻辑生成默认代码
      media_url_resolver: (data, resolve) => {
        if (data.url.indexOf('YOUR_SPECIAL_VIDEO_URL') !== -1) {
          const embedHtml = '';
          resolve({ html: embedHtml });
        } else {
          resolve({ html: '' });
        }
      },

      // 分页
      pagebreak_separator: '<!-- my page break -->',

      // 拆分块元素
      pagebreak_split_block: true,

      // 为编辑区锚点自定义样式 my-custom-class是样式名
      visual_anchor_class: 'my-custom-class',

      // 为编辑区表格自定义样式
      visual_table_class: 'my-custom-class',

      // 代码示例列表，可以根据插入的文本内容，适配合适的样式，比如java代码和html样式区分开来
      // codesample_languages: [
      //   {text: 'HTML/XML', value: 'markup'},
      //   {text: 'JavaScript', value: 'javascript'},
      //   {text: 'CSS', value: 'css'},
      //   {text: 'PHP', value: 'php'},
      // ],

      // 自定义示例样式
      // codesample_content_css: '/static/prism.css',

      // 禁止输入字符
      // media_alt_source: true,

      // 禁用视频
      // media_filter_html: false,

      // 可以预览视频
      // media_live_embeds: true,

      // 禁用Poster媒体对话框中的输入字段
      // media_poster: true,

      // 自定义监听图片上传
      images_upload_handler: (blobInfo, succFun, failFun) => {
        let xhr;
        let formData;
        const file = blobInfo.blob();
        xhr = new XMLHttpRequest();
        xhr.withCredentials = false;
        xhr.open(
          'POST',
          // 上传图片服务器地址
          environment.baseUrl + 'api/yangben-attachment/upload',
        );
        xhr.onload = () => {
          let json;
          if (!(xhr.status == 200 || xhr.status == 201)) {
            failFun('HTTP Error: ' + xhr.status);
            return;
          }
          json = JSON.parse(xhr.responseText);
          // 这里是图片服务器返回的图片地址，需要根据实际情况自己处理
          succFun(environment.baseUrl + 'api/yangben-attachment/download/' + json.attachmentId);
        };
        formData = new FormData();
        formData.append('file', file, file.name);
        formData.append('recUuid', 'tinyMCE');
        // 将图片显示到富文本编辑器中
        xhr.send(formData);
      },
    };
  }

  getData() {
    // console.log(this.html);
    return this.html;
  }
}
