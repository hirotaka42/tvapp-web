import { ThemeSwitch } from "@/app/themeSwitch";
import { ThemeSelector } from "@/app/themeSelector";
import { Main } from "@/components/Pages/Main";

export default function Home() {
  return (
    <main className="max-w-5xl mx-auto p-12 lg:p-24">
      <h2 className="text-2xl font-bold">Light/Dark mode switch on Next.js <ThemeSelector /></h2>
      <div className="mt-4 h-10">
        <ThemeSwitch />
      </div>
      <p className="mt-4">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu
        porta risus. Donec finibus dapibus nibh non ultricies. Donec ultricies
        nibh nec sem imperdiet malesuada. Fusce a sodales sem. Morbi eget
        eleifend nisl. Integer consequat dolor nulla, sit amet dignissim dolor
        fringilla sit amet. Donec nisl quam, luctus vitae felis id, suscipit
        fringilla massa. Aliquam eget fringilla lacus, et vestibulum sem.
        Pellentesque interdum velit in laoreet auctor. Integer vitae dui
        sodales, mattis est a, mollis odio. Vivamus vel eros sed eros gravida
        faucibus. In non facilisis neque, vel lacinia tellus. Integer in mattis
        enim, sed molestie enim. Maecenas et ultricies massa, vel laoreet lorem.
        Quisque ex sem, maximus fringilla ligula ut, bibendum facilisis massa.
      </p>

      <p className="mt-4">
        Aliquam in tortor id lorem varius tempus. Maecenas venenatis nulla eros,
        eget malesuada ante viverra a. Vestibulum aliquet porta turpis, eu
        ullamcorper magna volutpat dictum. Quisque sit amet ipsum eleifend,
        laoreet ante a, feugiat tellus. Proin malesuada mi eu justo tempor
        tincidunt. Phasellus nec eros auctor, finibus metus sed, accumsan est.
        Proin laoreet nisl bibendum ligula consequat, at tempor risus placerat.
        Aliquam dui mauris, posuere at erat vel, vestibulum sagittis magna.
        Phasellus tristique odio quis nisi ullamcorper euismod. Donec convallis
        dapibus diam vel faucibus. Vivamus mauris dui, scelerisque et ante a,
        vehicula pharetra tortor. Sed sed odio dui. Integer aliquam fringilla
        magna, sed imperdiet justo mollis vel. Duis ut ex velit. Sed non ante
        imperdiet, placerat nunc sit amet, rutrum ante. Morbi lectus nisi,
        ullamcorper eu luctus at, varius a eros.
      </p>
      <Main />
    </main>
  );
}
