package com.cabuyasjd.inventory.store

import android.content.Context
import android.content.SharedPreferences
import com.cabuyasjd.inventory.model.InventoryItem
import org.json.JSONArray
import org.json.JSONObject

internal class InventoryStore(context: Context) {

    private val prefs: SharedPreferences =
        context.getSharedPreferences("inventory_store", Context.MODE_PRIVATE)

    private val KEY_INVENTORY = "inventory"
    private val KEY_USERS = "users"
    private val KEY_LOGGED_USER = "logged_user"

    // --- Authentication ---

    fun registerUser(names: String, surnames: String, cedula: String, birthDate: String): Boolean {
        val usersJson = prefs.getString(KEY_USERS, "[]") ?: "[]"
        val usersArray = JSONArray(usersJson)
        
        // Check if user already exists
        for (i in 0 until usersArray.length()) {
            if (usersArray.getJSONObject(i).getString("cedula") == cedula) return false
        }

        val newUser = JSONObject().apply {
            put("names", names)
            put("surnames", surnames)
            put("cedula", cedula)
            put("birthDate", birthDate)
        }
        usersArray.put(newUser)
        prefs.edit().putString(KEY_USERS, usersArray.toString()).apply()
        return true
    }

    fun loginUser(cedula: String): String? {
        val usersJson = prefs.getString(KEY_USERS, "[]") ?: "[]"
        val usersArray = JSONArray(usersJson)
        for (i in 0 until usersArray.length()) {
            val user = usersArray.getJSONObject(i)
            if (user.getString("cedula") == cedula) {
                val fullName = "${user.getString("names")} ${user.getString("surnames")}"
                prefs.edit().putString(KEY_LOGGED_USER, fullName).apply()
                return fullName
            }
        }
        return null
    }

    fun getLoggedUser(): String? = prefs.getString(KEY_LOGGED_USER, null)

    fun logout() {
        prefs.edit().remove(KEY_LOGGED_USER).apply()
    }

    // --- Inventory ---

    fun getAll(): List<InventoryItem> {
        val json = prefs.getString(KEY_INVENTORY, null) ?: return emptyList()
        val array = JSONArray(json)
        val items = mutableListOf<InventoryItem>()
        for (i in 0 until array.length()) {
            val obj = array.optJSONObject(i) ?: continue
            val name = obj.optString("name")
            val qty = obj.optInt("quantity", 0)
            if (name.isNotEmpty()) {
                items.add(InventoryItem(name, qty))
            }
        }
        return items.sortedBy { it.name.lowercase() }
    }

    fun add(name: String, quantity: Int) {
        if (quantity <= 0) return
        val current = getMap().toMutableMap()
        current[name] = (current[name] ?: 0) + quantity
        saveMap(current)
    }

    fun remove(name: String, quantity: Int): Boolean {
        if (quantity <= 0) return false
        val current = getMap().toMutableMap()
        val existing = current[name] ?: return false
        if (quantity > existing) return false
        val updated = existing - quantity
        if (updated <= 0) {
            current.remove(name)
        } else {
            current[name] = updated
        }
        saveMap(current)
        return true
    }

    fun delete(name: String): Boolean {
        val current = getMap().toMutableMap()
        val removed = current.remove(name) != null
        if (removed) saveMap(current)
        return removed
    }

    fun search(query: String, threshold: Int?): List<InventoryItem> {
        val normalized = query.trim().lowercase()
        return getAll().filter { item ->
            val matchesQuery = normalized.isEmpty() || item.name.lowercase().contains(normalized)
            val meetsThreshold = threshold == null || item.quantity <= threshold
            matchesQuery && meetsThreshold
        }
    }

    private fun getMap(): Map<String, Int> {
        val json = prefs.getString(KEY_INVENTORY, null) ?: return emptyMap()
        val array = JSONArray(json)
        val map = mutableMapOf<String, Int>()
        for (i in 0 until array.length()) {
            val obj = array.optJSONObject(i) ?: continue
            val name = obj.optString("name")
            val qty = obj.optInt("quantity", 0)
            if (name.isNotEmpty()) {
                map[name] = qty
            }
        }
        return map
    }

    private fun saveMap(map: Map<String, Int>) {
        val array = JSONArray()
        map.entries.sortedBy { it.key.lowercase() }.forEach { (name, qty) ->
            val obj = JSONObject().apply {
                put("name", name)
                put("quantity", qty)
            }
            array.put(obj)
        }
        prefs.edit().putString(KEY_INVENTORY, array.toString()).apply()
    }
}
