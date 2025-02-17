
export const permissionsMatrix = {
  template: {
    create: ["authenticated"],
    read: ["any"],
    read_private: ["authenticated", "owner", "acl", "admin"],
    update: ["owner", "admin"],
    delete: ["owner", "admin"],
    manage_access: ["owner", "admin"]
  },
  question: {
    create: ["owner", "admin"],
    read: ["any"],
    read_private: ["authenticated", "owner", "acl", "admin"],
    update: ["owner", "admin"],
    delete: ["owner", "admin"],
    reorder: ["owner", "admin"],
  },
  form: {
    create: ["authenticated"],
    read: ["owner", "template_owner", "admin"],
    read_private: ["owner", "template_owner", "admin"],
    delete: ["admin", "owner"],
  },
  answer: {
    create: ["owner"],
    update: ["admin", "owner"],
    delete: ["admin", "owner"],
    read: ["admin", "owner"],
  },
};
