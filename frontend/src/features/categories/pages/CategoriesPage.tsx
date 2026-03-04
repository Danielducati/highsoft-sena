import { Card, CardContent, CardHeader } from "../../../shared/ui/card";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../shared/ui/table";
import { Badge } from "../../../shared/ui/badge";
import { Switch } from "../../../shared/ui/switch";
import { Search, ArrowUpDown, Eye, Pencil, Trash2 } from "lucide-react";
import { CategoriesModuleProps } from "../types";
import { ITEMS_PER_PAGE } from "../constants";
import { useCategories } from "../hooks/useCategories";
import { CategoryFormDialog } from "../components/CategoryFormDialog";
import { CategoryDetailDialog } from "../components/CategoryDetailDialog";
import { CategoryDeleteDialog } from "../components/CategoryDeleteDialog";

export function CategoriesPage({ userRole }: CategoriesModuleProps) {
  const {
    categories, loading,
    searchTerm, handleSearchChange,
    isDialogOpen, setIsDialogOpen,
    isDetailDialogOpen, setIsDetailDialogOpen,
    isDeleteDialogOpen, setIsDeleteDialogOpen,
    editingCategory, viewingCategory,
    formData, setFormData,
    sortField, sortOrder,
    currentPage, setCurrentPage,
    handleCreateOrUpdate, handleDeleteConfirm,
    handleToggleStatus, handleEdit,
    handleViewDetail, handleDeleteClick,
    handleSort, handleNewClick,
  } = useCategories();

  const filtered = categories
    .filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const order = sortOrder === "asc" ? 1 : -1;
      return sortField === "name"
        ? a.name.localeCompare(b.name) * order
        : (a.servicesCount - b.servicesCount) * order;
    });

  const totalPages   = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex   = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated    = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const totalServices    = categories.reduce((sum, c) => sum + c.servicesCount, 0);
  const activeCategories = categories.filter(c => c.isActive).length;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-foreground">Categorías de Servicios</h1>
          <p className="text-muted-foreground">Organiza y clasifica tus servicios</p>
        </div>
        <CategoryFormDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingCategory={editingCategory}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreateOrUpdate}
          onNewClick={handleNewClick}
          userRole={userRole}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Categorías",   value: categories.length },
          { label: "Categorías Activas", value: activeCategories  },
          { label: "Total Servicios",    value: totalServices      },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar categoría..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Cargando categorías...</p>
          ) : paginated.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No hay categorías registradas</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Color</TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("name")} className="flex items-center gap-2 -ml-4">
                      Nombre <ArrowUpDown className="w-4 h-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("servicesCount")} className="flex items-center gap-2 -ml-4">
                      Servicios <ArrowUpDown className="w-4 h-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Estado</TableHead>
                  {userRole === "admin" && <TableHead className="text-right">Acciones</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: category.color }} />
                    </TableCell>
                    <TableCell>
                      <p className="text-foreground">{category.name}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{category.servicesCount} servicios</Badge>
                    </TableCell>
                    <TableCell>
                      {userRole === "admin" ? (
                        <div className="flex items-center gap-2">
                          <Switch checked={category.isActive} onCheckedChange={() => handleToggleStatus(category)} />
                          <span className="text-sm text-muted-foreground">
                            {category.isActive ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                      ) : (
                        <Badge className={category.isActive ? "bg-primary text-foreground" : "bg-gray-500"}>
                          {category.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      )}
                    </TableCell>
                    {userRole === "admin" && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleViewDetail(category)} className="h-8 w-8" title="Ver detalle">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(category)} className="h-8 w-8" title="Editar">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(category.id)} className="h-8 w-8 text-destructive hover:text-destructive" title="Eliminar">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600">
            Mostrando {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)} de {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 text-sm">
              Anterior
            </Button>
            <span className="text-sm text-gray-600">Página {currentPage} de {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-8 text-sm">
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <CategoryDetailDialog
        isOpen={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        category={viewingCategory}
      />
      <CategoryDeleteDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}