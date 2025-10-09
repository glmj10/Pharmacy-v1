package map;

import java.util.HashMap;
import java.util.Map;
import java.util.Scanner;
import java.util.TreeMap;

public class Demo {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        Map<Character, Integer> map = new TreeMap<>();

        for(char item: s.toLowerCase().toCharArray()) {
            if(Character.isDigit(item) || Character.isLetter(item)) {
                map.put(item, map.getOrDefault(item, 0) + 1);
            }
        }

        for(Map.Entry<Character, Integer> entry: map.entrySet()) {
            System.out.print(entry.getKey() + " " + entry.getValue());
            System.out.println();
        }
        sc.close();
    }
}
