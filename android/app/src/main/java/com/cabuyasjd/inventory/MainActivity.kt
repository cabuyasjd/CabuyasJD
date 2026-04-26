package com.cabuyasjd.inventory

import android.app.DatePickerDialog
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.cabuyasjd.inventory.adapter.InventoryAdapter
import com.cabuyasjd.inventory.store.InventoryStore
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.tabs.TabLayout
import java.util.*

class MainActivity : AppCompatActivity() {

    private lateinit var inventoryStore: InventoryStore
    
    // UI Sections
    private lateinit var scrollAuth: View
    private lateinit var layoutMenu: View
    private lateinit var tvHeaderTitle: TextView
    
    // Auth Fields
    private lateinit var tabAuth: TabLayout
    private lateinit var etCedula: EditText
    private lateinit var etNombres: EditText
    private lateinit var etApellidos: EditText
    private lateinit var etFnac: EditText
    private lateinit var layoutRegisterFields: View
    private lateinit var btnAuthAction: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        inventoryStore = InventoryStore(this)
        
        initViews()
        setupAuth()
        setupMenu()
        
        checkLoginStatus()
    }

    private fun initViews() {
        scrollAuth = findViewById(R.id.scrollAuth)
        layoutMenu = findViewById(R.id.layoutMenu)
        tvHeaderTitle = findViewById(R.id.tvHeaderTitle)
        
        tabAuth = findViewById(R.id.tabAuth)
        etCedula = findViewById(R.id.etCedula)
        etNombres = findViewById(R.id.etNombres)
        etApellidos = findViewById(R.id.etApellidos)
        etFnac = findViewById(R.id.etFnac)
        layoutRegisterFields = findViewById(R.id.layoutRegisterFields)
        btnAuthAction = findViewById(R.id.btnAuthAction)

        etFnac.isFocusable = false
        etFnac.setOnClickListener { showDatePicker() }
    }

    private fun showDatePicker() {
        val calendar = Calendar.getInstance()
        val year = calendar.get(Calendar.YEAR)
        val month = calendar.get(Calendar.MONTH)
        val day = calendar.get(Calendar.DAY_OF_MONTH)

        DatePickerDialog(this, { _, selectedYear, selectedMonth, selectedDay ->
            val date = String.format("%02d/%02d/%04d", selectedDay, selectedMonth + 1, selectedYear)
            etFnac.setText(date)
        }, year, month, day).show()
    }

    private fun checkLoginStatus() {
        val user = inventoryStore.getLoggedUser()
        if (user != null) showMenu(user) else showAuth()
    }

    private fun showAuth() {
        scrollAuth.visibility = View.VISIBLE
        layoutMenu.visibility = View.GONE
        tvHeaderTitle.text = "Inventario Cabuyas JD - Usuario: Invitado"
    }

    private fun showMenu(userName: String) {
        scrollAuth.visibility = View.GONE
        layoutMenu.visibility = View.VISIBLE
        tvHeaderTitle.text = "Inventario Cabuyas JD - Usuario: $userName"
    }

    private fun setupAuth() {
        tabAuth.addOnTabSelectedListener(object : TabLayout.OnTabSelectedListener {
            override fun onTabSelected(tab: TabLayout.Tab?) {
                if (tab?.position == 0) {
                    layoutRegisterFields.visibility = View.GONE
                    btnAuthAction.text = "Ingresar"
                } else {
                    layoutRegisterFields.visibility = View.VISIBLE
                    btnAuthAction.text = "Registrar"
                }
            }
            override fun onTabUnselected(tab: TabLayout.Tab?) {}
            override fun onTabReselected(tab: TabLayout.Tab?) {}
        })

        btnAuthAction.setOnClickListener {
            val cedula = etCedula.text.toString().trim()
            if (cedula.isEmpty()) {
                Toast.makeText(this, "Ingresa tu cédula", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            if (tabAuth.selectedTabPosition == 0) {
                val name = inventoryStore.loginUser(cedula)
                if (name != null) showMenu(name) else showErrorDialog(listOf("Usuario no encontrado."))
            } else {
                val names = etNombres.text.toString().trim()
                val surnames = etApellidos.text.toString().trim()
                val fnac = etFnac.text.toString().trim()
                if (names.isEmpty() || surnames.isEmpty() || fnac.isEmpty()) {
                    showErrorDialog(listOf("Completa todos los campos."))
                    return@setOnClickListener
                }
                if (inventoryStore.registerUser(names, surnames, cedula, fnac)) {
                    val fullName = inventoryStore.loginUser(cedula)!!
                    showMenu(fullName)
                } else {
                    showErrorDialog(listOf("Cédula ya registrada."))
                }
            }
        }
    }

    private fun setupMenu() {
        findViewById<View>(R.id.btnAgregarProducto).apply {
            setOnClickListener { showAddProductDialog() }
            setOnLongClickListener { showHelp("Agregar Producto: Registra un producto nuevo o aumenta el stock.") }
        }

        findViewById<View>(R.id.btnRetirarProducto).apply {
            setOnClickListener { showRemoveProductDialog() }
            setOnLongClickListener { showHelp("Retirar Producto: Disminuye la cantidad de un producto.") }
        }

        findViewById<View>(R.id.btnListarInventario).apply {
            setOnClickListener { showListInventoryDialog() }
            setOnLongClickListener { showHelp("Listar Inventario: Ver la lista completa de productos.") }
        }

        findViewById<View>(R.id.btnBuscarBajoStock).apply {
            setOnClickListener { showSearchStockDialog() }
            setOnLongClickListener { showHelp("Buscar / Stock Bajo: Filtra por nombre o encuentra stock agotándose.") }
        }

        findViewById<View>(R.id.btnEliminarProducto).apply {
            setOnClickListener { showDeleteProductDialog() }
            setOnLongClickListener { showHelp("Eliminar Producto: Borra definitivamente un producto.") }
        }

        findViewById<View>(R.id.btnHowItWorks).setOnClickListener { showHowItWorks() }
        
        findViewById<Button>(R.id.btnSalir).apply {
            setOnClickListener {
                inventoryStore.logout()
                showAuth()
            }
            setOnLongClickListener { showHelp("Salir: Cierra la sesión actual.") }
        }
    }

    private fun showHelp(message: String): Boolean {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
        return true
    }

    private fun showHowItWorks() {
        val guide = """
            GUÍA RÁPIDA DE USO:
            
            1. Registro/Login: Ingresa con tu cédula para gestionar tu inventario.
            
            2. Agregar: Escribe el nombre y la cantidad. Si existe, se suma.
            
            3. Retirar: Selecciona el producto y la cantidad a descontar.
            
            4. Listar: Revisa todo tu inventario en una sola lista.
            
            5. Buscar/Stock: Filtra por nombre o stock bajo.
            
            Consejo: Mantén presionado cualquier botón para ver una ayuda rápida.
        """.trimIndent()
        
        MaterialAlertDialogBuilder(this)
            .setTitle("¿Cómo funciona?")
            .setMessage(guide)
            .setPositiveButton("Entendido", null)
            .show()
    }

    private fun createAdapter(recyclerView: RecyclerView, targetEditText: EditText? = null): InventoryAdapter {
        val adapter = InventoryAdapter(
            items = inventoryStore.getAll(),
            onItemClick = { item -> 
                targetEditText?.setText(item.name)
            }
        )
        recyclerView.layoutManager = LinearLayoutManager(this)
        recyclerView.adapter = adapter
        return adapter
    }

    private fun showAddProductDialog() {
        val layout = LayoutInflater.from(this).inflate(R.layout.dialog_add_product, null)
        val etProduct = layout.findViewById<EditText>(R.id.etProductAdd)
        val rvInventory = layout.findViewById<RecyclerView>(R.id.rvInventoryAdd)
        val btnConfirm = layout.findViewById<Button>(R.id.btnAddConfirm)
        val btnCancel = layout.findViewById<Button>(R.id.btnAddCancel)
        
        val adapter = createAdapter(rvInventory, etProduct)
        val dialog = MaterialAlertDialogBuilder(this).setView(layout).create()

        btnCancel.setOnClickListener { dialog.dismiss() }
        btnConfirm.setOnClickListener {
            val name = etProduct.text.toString().trim()
            if (name.isEmpty()) {
                showErrorDialog(listOf("Escribe el nombre del producto."))
                return@setOnClickListener
            }
            showQuantityDialog { qty ->
                inventoryStore.add(name, qty)
                adapter.updateItems(inventoryStore.getAll())
                showInfoDialog("Se han agregado $qty unidades de '$name'.")
            }
        }
        dialog.show()
    }

    private fun showRemoveProductDialog() {
        val layout = LayoutInflater.from(this).inflate(R.layout.dialog_remove_product, null)
        val etProduct = layout.findViewById<EditText>(R.id.etProductRemove)
        val rvInventory = layout.findViewById<RecyclerView>(R.id.rvInventoryRemove)
        val btnConfirm = layout.findViewById<Button>(R.id.btnRemoveConfirm)
        val btnCancel = layout.findViewById<Button>(R.id.btnRemoveCancel)

        val adapter = createAdapter(rvInventory, etProduct)
        val dialog = MaterialAlertDialogBuilder(this).setView(layout).create()

        btnCancel.setOnClickListener { dialog.dismiss() }
        btnConfirm.setOnClickListener {
            val name = etProduct.text.toString().trim()
            if (name.isEmpty()) {
                showErrorDialog(listOf("Selecciona un producto de la lista."))
                return@setOnClickListener
            }
            showQuantityDialog { qty ->
                if (inventoryStore.remove(name, qty)) {
                    adapter.updateItems(inventoryStore.getAll())
                    showInfoDialog("Se han retirado $qty unidades de '$name'.")
                } else {
                    showErrorDialog(listOf("No hay stock suficiente."))
                }
            }
        }
        dialog.show()
    }

    private fun showListInventoryDialog() {
        val layout = LayoutInflater.from(this).inflate(R.layout.dialog_list_inventory, null)
        val rvInventory = layout.findViewById<RecyclerView>(R.id.rvListInventory)
        val btnClose = layout.findViewById<Button>(R.id.btnListClose)
        
        createAdapter(rvInventory)

        val dialog = MaterialAlertDialogBuilder(this).setView(layout).create()
        btnClose.setOnClickListener { dialog.dismiss() }
        dialog.show()
    }

    private fun showSearchStockDialog() {
        val layout = LayoutInflater.from(this).inflate(R.layout.dialog_search_stock, null)
        val etQuery = layout.findViewById<EditText>(R.id.etSearchQuery)
        val etThreshold = layout.findViewById<EditText>(R.id.etLowStockThreshold)
        val rvResults = layout.findViewById<RecyclerView>(R.id.rvSearchResults)
        val btnExecute = layout.findViewById<Button>(R.id.btnSearchExecute)
        val btnClose = layout.findViewById<Button>(R.id.btnSearchClose)
        
        val adapter = createAdapter(rvResults)
        val dialog = MaterialAlertDialogBuilder(this).setView(layout).create()

        btnClose?.setOnClickListener { dialog.dismiss() }
        btnExecute.setOnClickListener {
            val results = inventoryStore.search(etQuery.text.toString(), etThreshold.text.toString().toIntOrNull())
            adapter.updateItems(results)
        }
        dialog.show()
    }

    private fun showDeleteProductDialog() {
        val layout = LayoutInflater.from(this).inflate(R.layout.dialog_delete_product, null)
        val rvInventory = layout.findViewById<RecyclerView>(R.id.rvDeleteProduct)
        val btnDelete = layout.findViewById<Button>(R.id.btnDeleteConfirm)
        val btnCancel = layout.findViewById<Button>(R.id.btnDeleteCancel)
        
        val adapter = createAdapter(rvInventory)
        val dialog = MaterialAlertDialogBuilder(this).setView(layout).create()

        btnCancel.setOnClickListener { dialog.dismiss() }
        btnDelete.setOnClickListener {
            val selected = adapter.getSelectedItem()
            if (selected != null) {
                MaterialAlertDialogBuilder(this)
                    .setTitle("Confirmar eliminación")
                    .setMessage("¿Eliminar '${selected.name}' definitivamente?")
                    .setPositiveButton("Eliminar") { _, _ ->
                        inventoryStore.delete(selected.name)
                        adapter.updateItems(inventoryStore.getAll())
                        showInfoDialog("Producto eliminado.")
                    }
                    .setNegativeButton("Cancelar", null)
                    .show()
            } else {
                showErrorDialog(listOf("Selecciona un producto."))
            }
        }
        dialog.show()
    }

    private fun showQuantityDialog(onConfirm: (Int) -> Unit) {
        val layout = LayoutInflater.from(this).inflate(R.layout.dialog_quantity, null)
        val etQuantity = layout.findViewById<EditText>(R.id.etQuantity)
        val btnConfirm = layout.findViewById<Button>(R.id.btnQuantityConfirm)
        val btnCancel = layout.findViewById<Button>(R.id.btnQuantityCancel)
        
        val dialog = MaterialAlertDialogBuilder(this).setView(layout).create()
        
        btnCancel?.setOnClickListener { dialog.dismiss() }
        btnConfirm.setOnClickListener {
            val value = etQuantity.text.toString().toIntOrNull() ?: 0
            if (value > 0) {
                onConfirm(value)
                dialog.dismiss()
            } else {
                Toast.makeText(this, "Ingresa un número válido", Toast.LENGTH_SHORT).show()
            }
        }
        dialog.show()
    }

    private fun showErrorDialog(messages: List<String>) {
        val layout = LayoutInflater.from(this).inflate(R.layout.dialog_error, null)
        val container = layout.findViewById<android.widget.LinearLayout>(R.id.errorListContainer)
        container.removeAllViews()
        messages.forEach { msg ->
            val tv = TextView(this).apply { text = "• $msg"; setTextColor(resources.getColor(R.color.danger, theme)) }
            container.addView(tv)
        }
        val dialog = MaterialAlertDialogBuilder(this).setView(layout).create()
        layout.findViewById<Button>(R.id.btnErrorClose).setOnClickListener { dialog.dismiss() }
        dialog.show()
    }

    private fun showInfoDialog(message: String) {
        val layout = LayoutInflater.from(this).inflate(R.layout.dialog_info, null)
        layout.findViewById<TextView>(R.id.tvInfoText).text = message
        val dialog = MaterialAlertDialogBuilder(this).setView(layout).create()
        layout.findViewById<Button>(R.id.btnInfoClose).setOnClickListener { dialog.dismiss() }
        dialog.show()
    }
}
