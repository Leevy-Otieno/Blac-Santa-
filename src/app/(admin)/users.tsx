import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface PlatformUser {
  id: string;
  name: string;
  contact: string;
  role: "buyer" | "shop" | "admin";
  active: boolean;
}

const INITIAL_USERS: PlatformUser[] = [
  {
    id: "usr-1",
    name: "Amina Wanjiku",
    contact: "+254723456789",
    role: "shop",
    active: true,
  },
  {
    id: "usr-2",
    name: "Brian Kamau",
    contact: "+254712345678",
    role: "shop",
    active: true,
  },
  {
    id: "usr-3",
    name: "BLAC SANTA Admin",
    contact: "admin@blacsanta.co.ke",
    role: "admin",
    active: true,
  },
  {
    id: "usr-4",
    name: "Nairobi Gift Buyer",
    contact: "+254700112233",
    role: "buyer",
    active: true,
  },
];

const ROLES: PlatformUser["role"][] = ["buyer", "shop", "admin"];

export default function AdminUsersScreen() {
  const insets = useSafeAreaInsets();
  const [users, setUsers] = useState<PlatformUser[]>(INITIAL_USERS);
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.contact.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q),
    );
  }, [users, search]);

  const changeUserRole = (userId: string, newRole: PlatformUser["role"]) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
    );
    Alert.alert("Role Updated", `Assigned ${newRole.toUpperCase()} role.`);
  };

  return (
    <View
      className="flex-1 bg-rose-50/60"
      style={{ paddingTop: Math.max(insets.top, 12) }}
    >
      <View className="mx-4 mb-3">
        <Text className="text-xl font-extrabold text-rose-950">
          Platform Users ({filteredUsers.length})
        </Text>
      </View>

      <View className="mx-4 flex-row items-center bg-white rounded-2xl px-4 py-2.5 border border-rose-200 mb-3">
        <Ionicons name="search" size={18} color="#E11D48" />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search user name, phone, email, or role..."
          placeholderTextColor="#FDA4AF"
          className="flex-1 ml-2.5 text-sm text-rose-950"
        />
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: Math.max(insets.bottom, 20) + 16,
        }}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.delay(index * 55).springify()}
            layout={Layout.springify()}
          >
            <View className="bg-white rounded-3xl p-4 mb-3 border border-rose-100">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-sm font-extrabold text-rose-950">
                    {item.name}
                  </Text>
                  <Text className="text-xs text-rose-700/80 mt-0.5">
                    {item.contact}
                  </Text>
                </View>

                <View className="bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
                  <Text className="text-[10px] font-extrabold text-rose-700 uppercase">
                    {item.role}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center gap-2 mt-3 pt-3 border-t border-rose-100">
                {ROLES.map((role) => {
                  const selected = item.role === role;
                  return (
                    <Pressable
                      key={role}
                      onPress={() => changeUserRole(item.id, role)}
                      className={`flex-1 py-2 rounded-xl border items-center ${
                        selected
                          ? "bg-rose-600 border-rose-600"
                          : "bg-white border-rose-200"
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold capitalize ${
                          selected ? "text-white" : "text-rose-900"
                        }`}
                      >
                        {role}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </Animated.View>
        )}
      />
    </View>
  );
}
