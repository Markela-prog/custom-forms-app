
export const permissionsMatrix = {
  template: {
    create: ["authenticated"],
    read: ["any", "authenticated", "owner", "acl", "admin"],
    read_private: ["authenticated", "owner", "acl", "admin"],
    read_all: ["authenticated", "admin"],
    update: ["owner", "admin"],
    delete: ["owner", "admin"],
    manage_access: ["owner", "admin"]
  },
  question: {
    create: ["owner", "admin"],
    read: ["any", "authenticated", "owner", "acl", "admin"],
    read_private: ["authenticated", "owner", "acl", "admin"],
    update: ["owner", "admin"],
    delete: ["owner", "admin"],
    reorder: ["owner", "admin"],
  },
  form: {
    create: ["authenticated"],
    read: ["owner", "template_owner", "admin"],
    read_private: ["owner", "template_owner", "admin"],
    read_all: ["admin"],
    getUserForms: ["authenticated"],
    delete: ["admin", "owner"],
  },
  answer: {
    create: ["owner", "admin"],
    update: ["admin", "owner"],
    delete: ["admin", "owner"],
    read: ["admin", "owner"],
  },
};
