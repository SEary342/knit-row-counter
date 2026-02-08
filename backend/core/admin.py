from sqladmin import ModelView
from backend.models import User, Project, Section, PatternRow, ProgressRecord


class UserAdmin(ModelView, model=User):
    column_list = [User.id, User.username, User.email]
    column_searchable_list = [User.username, User.email]
    icon = "fa-solid fa-user"


class ProjectAdmin(ModelView, model=Project):
    column_list = [Project.id, Project.name, Project.last_modified]
    column_searchable_list = [Project.name]
    icon = "fa-solid fa-sheet-plastic"


class SectionAdmin(ModelView, model=Section):
    column_list = [Section.id, Section.name, Section.project_id]
    icon = "fa-solid fa-layer-group"


class PatternRowAdmin(ModelView, model=PatternRow):
    column_list = [PatternRow.id, PatternRow.instruction, PatternRow.order]
    icon = "fa-solid fa-list-ol"


class ProgressRecordAdmin(ModelView, model=ProgressRecord):
    column_list = [ProgressRecord.id, ProgressRecord.timestamp]
    icon = "fa-solid fa-chart-line"
