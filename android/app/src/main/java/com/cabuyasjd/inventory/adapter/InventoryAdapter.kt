package com.cabuyasjd.inventory.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.cabuyasjd.inventory.R
import com.cabuyasjd.inventory.model.InventoryItem

class InventoryAdapter(
    private var items: List<InventoryItem>,
    private val onItemClick: (InventoryItem) -> Unit = {}
) : RecyclerView.Adapter<InventoryAdapter.ViewHolder>() {

    private var selectedName: String? = null

    fun updateItems(newItems: List<InventoryItem>) {
        items = newItems
        selectedName = null
        notifyDataSetChanged()
    }

    fun getSelectedItem(): InventoryItem? = items.find { it.name == selectedName }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_inventory, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val item = items[position]
        holder.bind(item)
        
        holder.itemView.isSelected = (item.name == selectedName)
        
        holder.itemView.setOnClickListener {
            selectedName = item.name
            notifyDataSetChanged()
            onItemClick(item)
        }
    }

    override fun getItemCount(): Int = items.size

    class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val tvName: TextView = itemView.findViewById(R.id.tvItemName)
        private val tvQuantity: TextView = itemView.findViewById(R.id.tvItemQuantity)

        fun bind(item: InventoryItem) {
            tvName.text = item.name
            tvQuantity.text = "${item.quantity}"
        }
    }
}
