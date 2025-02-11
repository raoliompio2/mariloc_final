import { Button } from "../../../components/ui/button"
import { Card } from "../../../components/ui/card"
import { Trash2, AlertCircle } from "lucide-react"

interface ContentListProps<T> {
  title?: string
  items: T[]
  renderItem: (item: T) => React.ReactNode
  onDelete: (id: string) => void
  gridCols?: string
  showCount?: boolean
}

export function ContentList<T extends { id: string }>({
  title,
  items,
  renderItem,
  onDelete,
  gridCols = "md:grid-cols-3",
  showCount = true
}: ContentListProps<T>) {
  return (
    <div className="space-y-6">
      {title && (
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {showCount && (
              <p className="text-sm text-gray-500">
                {items?.length || 0} {(items?.length || 0) === 1 ? 'item cadastrado' : 'itens cadastrados'}
              </p>
            )}
          </div>
        </div>
      )}
      
      {!items?.length ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12 px-4 text-gray-500 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
          <AlertCircle className="h-6 w-6 text-gray-400" />
          <div className="text-center">
            <p className="font-medium">Nenhum item cadastrado</p>
            <p className="text-sm text-gray-400">Os itens adicionados aparecerão aqui</p>
          </div>
        </div>
      ) : (
        <div className={`grid gap-6 ${gridCols}`}>
          {items.map((item) => (
            <Card 
              key={item.id} 
              className="group relative overflow-hidden border border-gray-200 hover:border-primary/20 hover:shadow-md hover:shadow-primary/5 transition-all duration-200"
            >
              <div className="p-6">
                {renderItem(item)}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-50"
                  onClick={() => onDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4 text-gray-400 group-hover:text-red-500 transition-colors" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
