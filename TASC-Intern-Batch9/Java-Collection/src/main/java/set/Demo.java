package set;

import java.util.HashSet;
import java.util.Scanner;
import java.util.Set;
import java.util.TreeSet;

public class Demo {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        Set<Integer> set = new HashSet<>();
        while(n-- > 0) {
            set.add(sc.nextInt());
        }

        System.out.println(set);

        Set<Integer> treeSet = new TreeSet<>(set);
        System.out.println(treeSet);

    }

}
