from sqladmin import ModelView

from backend.models.project import Project, Section
from backend.models.user import User


class UserAdmin(ModelView, model=User):
    column_list = [User.id, User.username, User.email]
    column_searchable_list = [User.username, User.email]
    icon = "fa-solid fa-user"


class ProjectAdmin(ModelView, model=Project):
    column_list = [Project.id, Project.name, Project.last_modified]
    column_filters = [Project.name]
    icon = "fa-solid fa-sheet-plastic"


class SectionAdmin(ModelView, model=Section):
    column_list = [Section.id, Section.name, Section.project_id]
    icon = "fa-solid fa-layer-group"


# Add more views as needed for PatternRow and ProgressRecord
