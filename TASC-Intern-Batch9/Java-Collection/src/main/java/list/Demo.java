package list;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Scanner;

public class Demo {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        List<Integer> list = new ArrayList<>();
        while(n-- > 0) {
            list.add(sc.nextInt());
        }

        Collections.sort(list);
        System.out.println(list);
        System.out.println(list.getFirst());
        System.out.println(list.getLast());
    }
}
