import { matchSorter } from "match-sorter";
import { GetStaticProps, InferGetStaticPropsType } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { useInfiniteQuery } from "react-query";
import Card from "~/components/Card";
import Filter from "~/components/Filter";

const Home = ({ data }: InferGetStaticPropsType<typeof getStaticProps>) => {
  const router = useRouter();
  // const {
  //   data: countriesData,
  //   isLoading,
  //   isFetching,
  //   fetchNextPage,
  //   hasNextPage,
  //   error,
  // } = useInfiniteQuery("countries", {
  //   getNextPageParam: (lastPage, pages) => {

  //   },
  // });
  // console.log(countriesData);

  //orders by alphabetical order at first, whenever you type it gets the value from the URL search query params
  // and then orders using the matchSorter algorithm.
  const orderedCountries = matchSorter(
    data,
    router.query.search ? (router.query.search as string) : "",
    { keys: ["name.common"] }
  );

  //filters by region, also from url query
  const countriesWithRegion = orderedCountries.filter(
    router.query.region
      ? (country) => country.region === router.query.region
      : (country) => !(country.region === null)
  );

  const countries = countriesWithRegion.map((country, index) => (
    <Card
      key={country.name.official}
      to={country.name.common}
      name={country.name.common}
      flag={{
        src: country.flags.png,
        alt: country.flags.alt,
      }}
      region={country.region}
      capital={country.capital}
      population={country.population}
    />
  ));

  return (
    <>
      <Head>
        <title>Countries!</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link
          rel="icon"
          href="https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fcdn.onlinewebfonts.com%2Fsvg%2Fimg_431077.png&f=1&nofb=1&ipt=6ceb11c647752f70e4af3cf96af452b1d5fd5687459e2dd693aee7540eb82326&ipo=images"
        />
      </Head>

      <div className="flex flex-wrap justify-center gap-8  p-6  md:p-10 xl:gap-10">
        <Filter />
        {countries}
      </div>
    </>
  );
};

export default Home;

export const getStaticProps: GetStaticProps<{
  data: [
    {
      name: { common: string; official: string };
      flags: { png: string; alt: string };
      region: string;
      capital: string;
      population: string;
    }
  ];
}> = async function () {
  // appreciate the typesafety provided on getstaticprops
  const res = await fetch(
    // really awesome api lol allows u to filter and stuff,
    "https://restcountries.com/v3.1/all?fields=name,region,capital,name,population,flags"
  );

  const data: [
    {
      name: { common: string; official: string };
      flags: { png: string; alt: string };
      region: string;
      capital: string;
      population: string;
    }
  ] = await res.json();

  if (!data) {
    return {
      notFound: true,
    };
  }

  return {
    props: { data },
  };
};

//sorts alphabetically then maps over it
