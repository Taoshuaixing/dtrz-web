import { Component, OnInit, Input, EventEmitter, Output, ViewChild } from '@angular/core';
import { CrudService } from 'src/app/routes/crud.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '@env/environment';
import { NzFormatEmitEvent, NzTreeComponent, NzTreeNode } from 'ng-zorro-antd/tree';

@Component({
  selector: 'app-nz-modal-position-and-account',
  templateUrl: './nz-modal-position-and-account.component.html',
  styleUrls: ['./nz-modal-position-and-account.component.css'],
})
export class NzModalPositionAndAccountComponent implements OnInit {
  constructor(private crudService: CrudService, public msgSrv: NzMessageService, private fb: FormBuilder) {}

  @ViewChild('nzTreeComponent', { static: false }) nzTreeComponent!: NzTreeComponent;
  isVisible = false;
  isOkLoading = false;

  userId = null;
  userName = null;
  realName = null;
  password = null;
  sex = 0;
  userStatus = 0;
  remarks = null;
  postId = 0;
  roleId = 3;
  createUser = 0;
  posts = [];
  menuList: any[];

  defaultCheckedKeys = [];

  // 角色与菜单关系
  menuControlItems = [
    {
      role: 'dagl_admin',
      disableMenus: ['yangben-stat-wenzi', 'yangben-select-manage'],
      activeMenus: [
        'zhanghao-config',
        'yangben-event-config',
        'yangben-config',
        'settings',
        'yangben-manage',
        'yangben-share',
        'yangben-stat-post',
        'yangben-event-import',
        'journal-submitted',
        'zhanghao-data-1',
      ],
    },
    {
      role: 'dagl_post',
      disableMenus: [
        'zhanghao-config',
        'zhanghao-data-1',
        'yangben-event-config',
        'yangben-config',
        'settings',
        'yangben-stat-wenzi',
        'yangben-select-manage',
        'yangben-event-import',
        'journal-submitted',
      ],
      activeMenus: ['yangben-manage', 'yangben-share', 'yangben-stat-post'],
    },
    {
      role: 'dagl_editor',
      disableMenus: [
        'zhanghao-config',
        'zhanghao-data-1',
        'yangben-event-config',
        'yangben-config',
        'settings',
        'yangben-manage',
        'yangben-share',
        'yangben-stat-post',
        'yangben-event-import',
        'journal-submitted',
      ],
      activeMenus: ['yangben-stat-wenzi', 'yangben-select-manage'],
    },
  ];

  validateForm!: FormGroup;

  @Input() users: any;
  @Input() parentPostId: any;
  @Input() btnName: string;
  @Output() editorOk = new EventEmitter();
  roleTypes: any = [];
  menuTypes: any = [];
  menuNodes: any = [];
  ngOnInit() {
    // 验证初始化
    this.validateForm = this.fb.group({
      userName: [null, [Validators.required]],
      password: [null, []],
      role_zxtj: [null, []],
      role_dagl: [null, []],
      menus: [null, []],
      postId: [null, [Validators.required]],
    });
  }

  getPosts(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.posts = [];
      this.posts.push({ postName: '无岗位人员', id: 0 });
      this.crudService.searchAll(environment.baseUrl_zxtj + 'api', 'post').subscribe((res: any[]) => {
        for (const item of res) {
          this.posts.push(item);
        }
        resolve(null);
      });
    });
  }

  async showModal(): Promise<void> {
    this.isVisible = true;

    const ss = await new Promise<void>((resolve) => {
      // 获取权限列表;
      this.crudService.searchAll(environment.baseUrl_zxtj + 'api', 'role').subscribe(
        (res: any[]) => {
          const sysList = [];
          const sysObjList = [];
          res.forEach((it) => {
            if (sysList.indexOf(it.sysName) < 0) {
              sysList.push(it.sysName);
              sysObjList.push({ sysName: it.sysName, sysCode: it.sysCode });
            }
          });
          this.roleTypes = sysObjList.map((m) => {
            const ff = res.filter((f) => f.sysName === m.sysName);
            const data = [];
            for (const role of ff) {
              data.push({ label: role.roleName, value: role.id, checked: false, roleCode: role.roleCode });
            }
            return { sysName: m.sysName, sysCode: m.sysCode, data };
          });
          resolve(this.roleTypes);
        },
        (error) => {},
      );
    });

    // 菜单初始树型
    this.menuList = await new Promise<any[]>((resolve) => {
      // 获取菜单列表;
      this.crudService.searchAll(environment.baseUrl_zxtj + 'api', 'menu').subscribe(
        (res: any[]) => {
          if (res && res.length > 0) {
            const data = [];
            // 扩展叶子属性，为默认选中排除使用
            res.map((m) => {
              m.isLeaf = !res.some((it) => it.parent && m.id === it.parent.id);
            });

            // 获取根节点
            for (const it of res) {
              if (it.parent === null) {
                data.push(it);
              }
            }

            // 组装树
            const treeData = data.map((m1) => {
              const children = res.filter((r) => r.parent && r.parent.id === m1.id);

              const newChildren = children.map((m2) => {
                const children1 = res.filter((r) => r.parent && r.parent.id === m2.id);

                let isLeafFlag = true;
                if (children1 && children1.length > 0) {
                  isLeafFlag = false;
                }

                const newChildren1 = children1.map((m3) => {
                  const children2 = res.filter((r) => r.parent && r.parent.id === m3.id);

                  let isLeafFlag2 = true;
                  if (children2 && children2.length > 0) {
                    isLeafFlag2 = false;
                  }

                  const newChildren2 = children2.map((m4) => {
                    return {
                      title: m4.menuName,
                      key: String(m4.id),
                      expanded: false,
                      isLeaf: true,
                      selectable: false,
                      disableCheckbox: false,
                    };
                  });
                  return {
                    title: m3.menuName,
                    key: String(m3.id),
                    expanded: false,
                    isLeaf: isLeafFlag2,
                    children: newChildren2,
                    selectable: false,
                    disableCheckbox: false,
                  };
                });
                return {
                  title: m2.menuName,
                  key: String(m2.id),
                  expanded: false,
                  isLeaf: isLeafFlag,
                  children: newChildren1,
                  selectable: false,
                  disableCheckbox: false,
                };
              });
              return {
                title: m1.menuName,
                key: String(m1.id),
                expanded: true,
                isLeaf: false,
                children: newChildren,
                selectable: false,
                disableCheckbox: false,
              };
            });

            this.menuTypes = treeData;
          }

          resolve(res);
        },
        (error) => {},
      );
    });

    await this.getPosts();

    if (this.users) {
      // 初始化时候给user赋值，防止双向绑定的users影响父组件的页面值
      this.userId = this.users.id;
      this.userName = this.users.userName;
      this.realName = this.users.realName;
      this.password = this.users.password;
      this.remarks = this.users.remarks;
      this.sex = this.users.sex;
      this.createUser = this.users.createUser;

      if (this.users.posts && this.users.posts.length > 0) {
        this.postId = this.users.posts[0].id;
      } else {
        this.postId = 0;
      }

      if (this.users.roles && this.users.roles.length > 0) {
        // this.roleId = this.users.roles[0].id;
        this.roleTypes.map((m) => {
          m.data.map((m1) => {
            if (this.users.roles.filter((f) => f.id === m1.value).length > 0) {
              m1.checked = true;
              m1.disabled = this.userName === 'admin' && (m1.roleCode === 'dagl_admin' || m1.roleCode === 'admin') ? true : false;
            }
          });
        });
      } else {
        this.roleId = 0;
      }

      if (this.users.menus && this.users.menus.length > 0) {
        // 设置菜单树默认选中项
        this.defaultCheckedKeys = [];
        this.users.menus.filter((f) => {
          const ff = this.menuList.find((f1) => f.id == f1.id && f1.isLeaf);
          if (ff) {
            this.defaultCheckedKeys.push(String(ff.id));
          }
        });
      }

      this.userStatus = this.users.userStatus;
    } else {
      this.validateForm.patchValue({
        userName: null,
        realName: null,
        password: null,
        sex: 0,
        userStatus: 0,
        remarks: null,
        roleId: 3,
        postId: this.parentPostId,
      });
    }
    this.roleAndMenu();
  }

  async handleOk(): Promise<void> {
    if (!this.validateForm.valid) {
      // tslint:disable-next-line:forin
      for (const i in this.validateForm.controls) {
        this.validateForm.controls[i].markAsDirty();
        this.validateForm.controls[i].updateValueAndValidity();
      }
      return;
    }

    if (this.userId) {
      const cnt: number = await new Promise<number>((resolve) => {
        this.crudService
          .search(environment.baseUrl_zxtj + 'api', 'user', {
            filter: [`id||$ne||${this.userId}`, `userName||eq||${this.userName}`],
          })
          .subscribe((res: any[]) => {
            resolve(res.length);
          });
      });
      if (cnt > 0) {
        this.msgSrv.create('warning', '该账户已存在！');
        return;
      }
    } else {
      const cnt: number = await new Promise<number>((resolve) => {
        this.crudService
          .search(environment.baseUrl_zxtj + 'api', 'user', {
            filter: [`userName||eq||${this.userName}`],
          })
          .subscribe((res: any[]) => {
            resolve(res.length);
          });
      });
      if (cnt > 0) {
        this.msgSrv.create('warning', '该账户已存在！');
        return;
      }
    }

    let roles = [];
    this.roleTypes.map((m) => {
      const ff = m.data.filter((f) => f.checked).map((m) => ({ id: m.value }));
      if (ff.length > 0) {
        roles = roles.concat(ff);
      }
    });
    let menus = [];

    // 获取树
    const nzTreeNodeAll = this.nzTreeComponent.getTreeNodes();

    for (const item of nzTreeNodeAll) {
      // 如果节点被check或者halfCheck半选
      if (item.isChecked || item.isHalfChecked) {
        menus.push({ id: Number(item.key) });
      }
      if (item.children) {
        for (const its of item.children) {
          if (its.isChecked || its.isHalfChecked) {
            menus.push({ id: Number(its.key) });
          }
          if (its.children) {
            for (const it of its.children) {
              if (it.isChecked || it.isHalfChecked) {
                menus.push({ id: Number(it.key) });
              }
              if (it.children) {
                for (const t of it.children) {
                  if (t.isChecked || t.isHalfChecked) {
                    menus.push({ id: Number(t.key) });
                  }
                }
              }
            }
          }
        }
      }
    }

    this.editorOk.emit({
      userId: this.userId,
      userName: this.userName,
      realName: this.realName,
      password: this.password,
      sex: this.sex,
      userStatus: this.userStatus,
      remarks: this.remarks,
      postId: this.postId,
      roles,
      menus,
      createUser: this.createUser,
      userType: 1,
    });
    this.isVisible = false;
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  roleAndMenu() {
    let roles = [];

    // 将当前角色设置到角色组中
    const curRoles = this.roleTypes.find((f) => f.sysCode === 'dagl');
    if (curRoles) {
      for (const it of curRoles.data) {
        if (it.checked) {
          roles.push(it.roleCode);
        }
      }
    }

    // 不可用菜单组
    const disableMenus = [];
    // 可用菜单组
    const activeMenus = [];

    // 递归设置disable 属性
    const recursionFilter = (nzTreeNode: NzTreeNode, flag: boolean) => {
      if (!nzTreeNode) return [];

      nzTreeNode.isDisabled = flag;
      if (flag && nzTreeNode.isChecked) {
        nzTreeNode.isChecked = false;
      }
      if (flag && nzTreeNode.isHalfChecked) {
        nzTreeNode.isHalfChecked = false;
      }
      // nzTreeNode.isChecked = !flag;

      if (nzTreeNode.children) {
        for (const item of nzTreeNode.children) {
          recursionFilter(item, flag);
        }
      }
    };

    // 根据所选角色 在 角色与菜单关系中 获取不可用菜单和可用菜单 并处理菜单树
    if (roles && roles.length > 0) {
      recursionFilter(this.nzTreeComponent.getTreeNodes()[0], false);
      for (const r of roles) {
        const item = this.menuControlItems.find((f) => f.role === r);
        if (item) {
          if (item.disableMenus) {
            for (const it of item.disableMenus) {
              disableMenus.push(it);
            }
          }

          if (item.activeMenus) {
            for (const it of item.activeMenus) {
              activeMenus.push(it);
            }
          }
        }
      }

      // 过滤掉不可用menuCode 中的 可用menuCode
      let newDisableList = [...disableMenus];
      for (const d of disableMenus) {
        const item = activeMenus.find((f) => f === d);
        if (item) {
          newDisableList = newDisableList.filter((f) => f !== item);
        }
      }

      // 根据不可用标识，处理菜单树
      if (newDisableList && newDisableList.length > 0) {
        // 默认菜单树 全可选
        recursionFilter(this.nzTreeComponent.getTreeNodes()[0], false);

        // 遍历不用menuCode 处理菜单树 将不可选菜单 isDisabled true
        for (const item of newDisableList) {
          const ff = this.menuList.find((f) => f.menuCode === item);
          if (ff) {
            recursionFilter(this.nzTreeComponent.getTreeNodeByKey(String(ff.id)), true);
          }
        }
      } else {
        // 如果没有不可用菜单 则菜单树 全可选
        recursionFilter(this.nzTreeComponent.getTreeNodes()[0], false);
      }
    } else {
      // 如果没有选择角色 则菜单树 全不可选
      recursionFilter(this.nzTreeComponent.getTreeNodes()[0], true);
    }
  }

  ngAfterViewInit(): void {
    this.nzTreeComponent.getTreeNodes();
  }
}
