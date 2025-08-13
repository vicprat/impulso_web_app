import { AdminLinks } from './AdminLinks'
import { UserRoleForm as Artist } from './Artist'
import { CategoryForm } from './Category'
import { EventForm as Event } from './Event'
import { ExpenseForm as Expense } from './Expense'
import { ImageUploader } from './ImageUploader'
import { Income } from './Income'
import { Links } from './Links'
import { PostForm } from './Post'
import { ProductForm } from './Product'
import { Profile } from './Profile'
import { Room } from './Room'
import { TagForm } from './Tag'

export const Form = {
  AdminLinks,
  Artist,
  Category: CategoryForm,
  Event,
  Expense,
  ImageUploader,
  Income,
  Links,
  Post: PostForm,
  Product: ProductForm,
  Profile,
  Room,
  Tag: TagForm,
}
